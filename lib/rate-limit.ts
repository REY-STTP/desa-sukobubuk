/**
 * F-103: SEC-008 — in-memory token-bucket rate limiter.
 *
 * Single-region only (Vercel single-region functions). On Vercel's
 * multi-region edge, replace with Upstash Ratelimit by adapting the
 * `consume()` function to call the Redis-backed limiter. The interface
 * is shaped to be drop-in compatible.
 *
 * State is held in a `Map<key, Bucket>` in module scope. State is lost on
 * cold start; this is acceptable for "5 logins / 15 min" style limits.
 *
 * The `Retry-After` header value returned to the caller is in seconds and
 * is the wait until the bucket refills enough to allow at least 1 request.
 */

interface Bucket {
  tokens: number
  updatedAt: number
}

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSec: number
  resetAtMs: number
}

export interface RateLimitOptions {
  /** Identifier (e.g. `login:1.2.3.4:user@example.com`). */
  key: string
  /** Maximum requests per window. */
  limit: number
  /** Window length in seconds. */
  windowSec: number
}

export function rateLimit(opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const windowMs = opts.windowSec * 1000
  const refillPerMs = opts.limit / windowMs
  const existing = buckets.get(opts.key)

  let tokens: number
  let updatedAt: number

  if (!existing) {
    tokens = opts.limit
    updatedAt = now
    buckets.set(opts.key, { tokens, updatedAt })
  } else {
    const elapsed = now - existing.updatedAt
    const refilled = Math.min(opts.limit, existing.tokens + elapsed * refillPerMs)
    tokens = refilled
    updatedAt = now
    buckets.set(opts.key, { tokens, updatedAt })
  }

  if (tokens >= 1) {
    tokens -= 1
    buckets.set(opts.key, { tokens, updatedAt })
    return {
      ok: true,
      remaining: Math.floor(tokens),
      retryAfterSec: 0,
      resetAtMs: now + Math.ceil((opts.limit - tokens) / refillPerMs),
    }
  }

  // Not enough tokens: compute time until 1 token is available.
  const msUntilOne = (1 - tokens) / refillPerMs
  const retryAfterSec = Math.max(1, Math.ceil(msUntilOne / 1000))
  return {
    ok: false,
    remaining: 0,
    retryAfterSec,
    resetAtMs: now + msUntilOne,
  }
}

/**
 * Build a stable key from request headers. Falls back to a constant when
 * the IP cannot be determined (very rare; happens only in unit tests).
 */
export function clientKey(req: Request, scope: string, ...parts: string[]): string {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    'unknown'
  return [scope, ip, ...parts].join(':')
}

/** Reset all buckets. Test-only helper. */
export function _resetRateLimit(): void {
  buckets.clear()
}
