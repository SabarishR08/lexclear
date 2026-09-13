type Bucket = {
  tokens: number;
  updatedAt: number;
};

export type RateLimitOptions = {
  capacity?: number;
  refillPerMinute?: number;
  now?: number;
};

/**
 * In-memory token bucket, keyed per user, guarding the two Server Actions that
 * call Gemini. A single serverless instance only sees its own share of traffic,
 * which is enough to stop one account from running up API spend in a loop.
 */
const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 1000;

export function takeToken(key: string, options: RateLimitOptions = {}): boolean {
  const { capacity = 6, refillPerMinute = 6, now = Date.now() } = options;
  const refillPerMs = refillPerMinute / 60_000;

  if (buckets.size >= MAX_TRACKED_KEYS) pruneBursts(capacity, now, refillPerMs);

  const bucket = buckets.get(key) ?? { tokens: capacity, updatedAt: now };
  const tokens = Math.min(capacity, bucket.tokens + (now - bucket.updatedAt) * refillPerMs);

  if (tokens < 1) {
    buckets.set(key, { tokens, updatedAt: now });
    return false;
  }

  buckets.set(key, { tokens: tokens - 1, updatedAt: now });
  return true;
}

function pruneBursts(capacity: number, now: number, refillPerMs: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.tokens + (now - bucket.updatedAt) * refillPerMs >= capacity) buckets.delete(key);
  }
}

export function resetRateLimits() {
  buckets.clear();
}
