/**
 * F-217 / PERF-007 — bounded retry wrapper for transient Prisma errors.
 *
 * The Supabase pooler occasionally returns `P1001` (Can't reach database
 * server) or `P1017` (Server has closed the connection) on cold-start
 * queries from Vercel serverless. These are transient. We retry up to
 * `MAX_ATTEMPTS` times with exponential backoff before giving up.
 *
 * Usage:
 *   const rows = await withDbRetry(() => prisma.user.findMany(...))
 *
 * Non-transient errors (P2002 unique-constraint, P2025 not-found, etc.)
 * are rethrown immediately.
 */
import { logger } from '@/lib/logger'

const MAX_ATTEMPTS = 2
const BASE_BACKOFF_MS = 200

const TRANSIENT_CODES = new Set(['P1001', 'P1017'])

function isTransient(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const code = (err as { code?: string }).code
  return typeof code === 'string' && TRANSIENT_CODES.has(code)
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (!isTransient(err) || attempt === MAX_ATTEMPTS) {
        throw err
      }
      const backoff = BASE_BACKOFF_MS * 2 ** (attempt - 1)

      logger.warn('transient Prisma error, retrying', {
        code: (err as { code?: string }).code,
        attempt,
        max: MAX_ATTEMPTS,
        backoffMs: backoff,
      })
      await sleep(backoff)
    }
  }
  // Unreachable, but TypeScript needs it.
  throw lastError
}

/** Test-only helper: expose internals for unit tests. */
export const _INTERNAL = { MAX_ATTEMPTS, BASE_BACKOFF_MS, TRANSIENT_CODES, isTransient }
