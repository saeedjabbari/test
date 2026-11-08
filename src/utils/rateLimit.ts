/**
 * Rate Limiting Utility to prevent bot abuse and spam submissions.
 * Enforces a strict limit of 3 reports per hour per client device.
 */

const REPORT_RATE_KEY = 'krf_report_timestamps';
export const MAX_REPORTS_PER_HOUR = 3;
const ONE_HOUR_MS = 60 * 60 * 1000; // 3600000 ms

export interface RateLimitStatus {
  allowed: boolean;
  count: number;
  remaining: number;
  retryAfterMinutes: number;
}

/**
 * Checks if the current client is allowed to submit a new report.
 */
export function getReportRateLimitStatus(): RateLimitStatus {
  try {
    const raw = localStorage.getItem(REPORT_RATE_KEY);
    const now = Date.now();
    const timestamps: number[] = raw ? JSON.parse(raw) : [];

    // Filter only timestamps within the rolling past 1 hour
    const valid = timestamps.filter(
      (t) => typeof t === 'number' && now - t < ONE_HOUR_MS
    );

    // Prune stale timestamps from storage if needed
    if (valid.length !== timestamps.length) {
      localStorage.setItem(REPORT_RATE_KEY, JSON.stringify(valid));
    }

    if (valid.length >= MAX_REPORTS_PER_HOUR) {
      const oldest = Math.min(...valid);
      const remainingMs = ONE_HOUR_MS - (now - oldest);
      const retryAfterMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
      return {
        allowed: false,
        count: valid.length,
        remaining: 0,
        retryAfterMinutes,
      };
    }

    return {
      allowed: true,
      count: valid.length,
      remaining: MAX_REPORTS_PER_HOUR - valid.length,
      retryAfterMinutes: 0,
    };
  } catch {
    return {
      allowed: true,
      count: 0,
      remaining: MAX_REPORTS_PER_HOUR,
      retryAfterMinutes: 0,
    };
  }
}

/**
 * Records a new report submission timestamp into localStorage.
 */
export function recordReportRateLimit(): void {
  try {
    const raw = localStorage.getItem(REPORT_RATE_KEY);
    const now = Date.now();
    const timestamps: number[] = raw ? JSON.parse(raw) : [];
    const valid = timestamps.filter(
      (t) => typeof t === 'number' && now - t < ONE_HOUR_MS
    );
    valid.push(now);
    localStorage.setItem(REPORT_RATE_KEY, JSON.stringify(valid));
  } catch {}
}
