import { useEffect, useRef } from 'react';

export function HeroBlobCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let rafId: number;
        let isRunning = true;
        let time = 0;

        const resize = () => {
            // Small 64x64 canvas upscaled by CSS is extremely cheap
            canvas.width = 64;
            canvas.height = 64;
        };

        const render = () => {
            if (!isRunning) return;
            time += 0.02;

            const w = canvas.width;
            const h = canvas.height;
            const cx = w / 2;
            const cy = h / 2;

            ctx.clearRect(0, 0, w, h);

            // Create a fluid breathing gradient
            const radius = 20 + Math.sin(time) * 4; // Breathes 16px to 24px

            const gradient = ctx.createRadialGradient(
                cx + Math.cos(time * 0.8) * 8, // slight orbit
                cy + Math.sin(time * 0.7) * 8,
                0,
                cx,
                cy,
                radius
            );

            // From cyan to blue
            gradient.addColorStop(0, 'rgba(0, 242, 254, 1)');
            gradient.addColorStop(1, 'rgba(79, 172, 254, 0.4)');

            ctx.fillStyle = gradient;
            ctx.beginPath();

            // Draw organic blob shape using bezier curves
            const points = 8;
            const step = (Math.PI * 2) / points;

            for (let i = 0; i <= points; i++) {
                const theta = i * step;
                // Perturb radius by sine waves based on angle and time
                const r = radius + Math.sin(theta * 3 + time) * 3 + Math.cos(theta * 2 - time * 1.5) * 2;

                const px = cx + Math.cos(theta) * r;
                const py = cy + Math.sin(theta) * r;

                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }

            ctx.closePath();
            ctx.fill();

            rafId = requestAnimationFrame(render);
        };

        const handleVisibility = () => {
            if (document.hidden) {
                isRunning = false;
                cancelAnimationFrame(rafId);
            } else {
                isRunning = true;
                render();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        resize();
        render();

        return () => {
            isRunning = false;
            cancelAnimationFrame(rafId);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
        />
    );
}
