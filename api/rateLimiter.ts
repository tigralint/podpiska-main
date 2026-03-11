/**
 * Sliding-window rate limiter.
 * Extracted from generateClaim.ts for testability and reuse.
 *
 * ⚠️ In-memory store resets on cold start in serverless (Vercel Functions).
 * For production-grade limiting, swap store with Vercel KV or Upstash Redis.
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

export class RateLimiter {
    private store = new Map<string, RateLimitEntry>();
    private limit: number;
    private windowMs: number;

    constructor(limit = 60, windowMs = 60 * 60 * 1000) {
        this.limit = limit;
        this.windowMs = windowMs;
    }

    /**
     * Returns true if the key has exceeded the rate limit.
     * Automatically resets the window if it has expired.
     */
    isLimited(key: string, now = Date.now()): boolean {
        const entry = this.store.get(key);

        if (!entry || now > entry.resetAt) {
            this.store.set(key, { count: 1, resetAt: now + this.windowMs });
            return false;
        }

        entry.count++;
        return entry.count > this.limit;
    }

    /** Remove expired entries to prevent memory leaks. */
    cleanup(now = Date.now()): void {
        for (const [key, entry] of this.store) {
            if (now > entry.resetAt) this.store.delete(key);
        }
    }

    /** Current request count for a key (for testing/monitoring). */
    getCount(key: string): number {
        return this.store.get(key)?.count ?? 0;
    }

    /** Reset all entries (for testing). */
    reset(): void {
        this.store.clear();
    }
}
