import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from './rateLimiter';

describe('RateLimiter', () => {
    let limiter: RateLimiter;

    beforeEach(() => {
        limiter = new RateLimiter(3, 10_000); // 3 requests per 10s window
    });

    it('should allow requests under the limit', () => {
        expect(limiter.isLimited('user1')).toBe(false); // 1
        expect(limiter.isLimited('user1')).toBe(false); // 2
        expect(limiter.isLimited('user1')).toBe(false); // 3
    });

    it('should block requests over the limit', () => {
        limiter.isLimited('user1'); // 1
        limiter.isLimited('user1'); // 2
        limiter.isLimited('user1'); // 3
        expect(limiter.isLimited('user1')).toBe(true); // 4 → blocked
    });

    it('should track keys independently', () => {
        limiter.isLimited('user1'); // user1: 1
        limiter.isLimited('user1'); // user1: 2
        limiter.isLimited('user1'); // user1: 3
        expect(limiter.isLimited('user1')).toBe(true);  // user1: blocked
        expect(limiter.isLimited('user2')).toBe(false);  // user2: 1
    });

    it('should reset window after expiry', () => {
        const now = 1000;
        limiter.isLimited('user1', now);       // 1
        limiter.isLimited('user1', now + 1);   // 2
        limiter.isLimited('user1', now + 2);   // 3
        expect(limiter.isLimited('user1', now + 3)).toBe(true); // 4 → blocked

        // After window expires
        expect(limiter.isLimited('user1', now + 11_000)).toBe(false); // new window → 1
    });

    it('should report count via getCount', () => {
        expect(limiter.getCount('user1')).toBe(0);
        limiter.isLimited('user1');
        expect(limiter.getCount('user1')).toBe(1);
        limiter.isLimited('user1');
        expect(limiter.getCount('user1')).toBe(2);
    });

    it('should cleanup expired entries', () => {
        const now = 1000;
        limiter.isLimited('user1', now);
        limiter.isLimited('user2', now);

        // user1 and user2 created. Cleanup at now + 11s should remove both
        limiter.cleanup(now + 11_000);
        expect(limiter.getCount('user1')).toBe(0);
        expect(limiter.getCount('user2')).toBe(0);
    });

    it('should not cleanup non-expired entries', () => {
        const now = 1000;
        limiter.isLimited('user1', now);
        limiter.cleanup(now + 5000); // only 5s passed, window is 10s
        expect(limiter.getCount('user1')).toBe(1);
    });

    it('should reset all entries', () => {
        limiter.isLimited('user1');
        limiter.isLimited('user2');
        limiter.reset();
        expect(limiter.getCount('user1')).toBe(0);
        expect(limiter.getCount('user2')).toBe(0);
    });
});
