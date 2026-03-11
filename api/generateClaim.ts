import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSubscriptionPrompt, buildCoursePrompt } from './promptBuilder';

interface TurnstileVerifyResponse {
    success: boolean;
    'error-codes'?: string[];
}

interface OpenRouterResponse {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
}

// --- Runtime Type Guards for request body validation ---
function isValidClaimData(d: unknown): d is { serviceName: string; amount: string; date: string; reason: string; tone: 'soft' | 'hard'; turnstileToken?: string } {
    if (typeof d !== 'object' || !d) return false;
    const obj = d as Record<string, unknown>;
    return typeof obj.serviceName === 'string' && obj.serviceName.trim().length > 0
        && typeof obj.amount === 'string'
        && typeof obj.date === 'string'
        && typeof obj.reason === 'string'
        && (obj.tone === 'soft' || obj.tone === 'hard');
}

function isValidCourseData(d: unknown): d is { courseName: string; totalCost: number; percentCompleted: number; tone: 'soft' | 'hard'; hasPlatformAccess: boolean; hasConsultations: boolean; hasCertificate: boolean; turnstileToken?: string } {
    if (typeof d !== 'object' || !d) return false;
    const obj = d as Record<string, unknown>;
    return typeof obj.courseName === 'string' && obj.courseName.trim().length > 0
        && typeof obj.totalCost === 'number' && obj.totalCost > 0
        && typeof obj.percentCompleted === 'number'
        && (obj.tone === 'soft' || obj.tone === 'hard')
        && typeof obj.hasPlatformAccess === 'boolean'
        && typeof obj.hasConsultations === 'boolean'
        && typeof obj.hasCertificate === 'boolean';
}

/**
 * Strips characters that could be used for prompt injection.
 * Removes instruction-like patterns while keeping normal user text.
 */
function sanitizeInput(input: string, maxLength = 200): string {
    return input
        .slice(0, maxLength)
        .replace(/[<>{}[\]]/g, '')       // Remove brackets that could break prompts
        .replace(/\n/g, ' ')             // Flatten newlines
        .trim();
}

import { RateLimiter } from './rateLimiter';

// --- Rate Limiter (60 req/hour per IP) ---
const limiter = new RateLimiter(60, 60 * 60 * 1000);

export default async function handler(
    request: VercelRequest,
    response: VercelResponse,
) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Rate limiting
    const clientIp = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        ?? request.socket?.remoteAddress
        ?? 'unknown';

    limiter.cleanup(); // Remove expired entries periodically

    if (limiter.isLimited(clientIp)) {
        return response.status(429).json({ error: 'Слишком много запросов. Попробуйте через некоторое время.' });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

    if (!OPENROUTER_API_KEY) {
        return response.status(500).json({ error: 'Сервер не настроен (API ключ отсутствует).' });
    }

    if (!TURNSTILE_SECRET_KEY) {
        return response.status(500).json({ error: 'Сервер не настроен (ключ капчи отсутствует).' });
    }

    try {
        const { type, data, calculatedRefund } = request.body;

        // Validate request type
        if (type !== 'subscription' && type !== 'course') {
            return response.status(400).json({ error: 'Неизвестный тип документа.' });
        }

        // Runtime validation of request body
        if (type === 'subscription' && !isValidClaimData(data)) {
            return response.status(400).json({ error: 'Некорректные данные подписки. Проверьте заполнение всех полей.' });
        }
        if (type === 'course') {
            if (!isValidCourseData(data)) {
                return response.status(400).json({ error: 'Некорректные данные курса. Проверьте заполнение всех полей.' });
            }
            if (typeof calculatedRefund !== 'number' || calculatedRefund < 0) {
                return response.status(400).json({ error: 'Некорректная сумма возврата.' });
            }
        }

        if (!data || !data.turnstileToken) {
            return response.status(403).json({ error: 'Капча не пройдена.' });
        }

        // Verify Turnstile
        const formData = new URLSearchParams();
        formData.append('secret', TURNSTILE_SECRET_KEY);
        formData.append('response', data.turnstileToken);

        const turnstileCheck = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const turnstileRes = await turnstileCheck.json() as TurnstileVerifyResponse;
        if (!turnstileRes.success) {
            return response.status(403).json({ error: 'Ошибка капчи.' });
        }

        // Sanitize all user-provided strings before embedding in prompt
        let prompt = '';
        if (type === 'subscription') {
            const serviceName = sanitizeInput(data.serviceName);
            const amount = sanitizeInput(String(data.amount), 20);
            const date = sanitizeInput(String(data.date), 20);
            const reason = sanitizeInput(data.reason);
            prompt = buildSubscriptionPrompt(serviceName, amount, date, reason, data.tone);
        } else {
            const courseName = sanitizeInput(data.courseName);
            const totalCost = sanitizeInput(String(data.totalCost), 20);
            const percentCompleted = sanitizeInput(String(data.percentCompleted), 5);
            const refund = sanitizeInput(String(calculatedRefund), 20);
            prompt = buildCoursePrompt(courseName, totalCost, percentCompleted, refund, data.tone);
        }

        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "qwen/qwen3-vl-30b-a3b-thinking",
                "messages": [{ "role": "user", "content": prompt }],
                "temperature": 0.1,
            })
        });

        const aiJson = await aiResponse.json() as OpenRouterResponse;
        const text = aiJson.choices?.[0]?.message?.content;

        if (!text) {
            return response.status(502).json({ error: 'ИИ-модель не вернула результат. Попробуйте повторить запрос.' });
        }

        return response.status(200).json({ text });

    } catch (error: unknown) {
        console.error(JSON.stringify({
            event: 'generateClaim_error',
            type: request.body?.type,
            ip: clientIp,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        }));
        return response.status(500).json({ error: 'Внутренняя ошибка сервера. Попробуйте позже.' });
    }
}
