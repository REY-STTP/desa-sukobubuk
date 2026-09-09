import { prisma } from '@/lib/prisma'
import { withDbRetry } from '@/lib/db-retry'
import { logger } from '@/lib/logger'

/**
 * F-209 / AUTH-002 — DB-backed failed-login tracking and lockout.
 *
 * Strategy:
 *   1. After a failed login, record a row in `failed_logins` with
 *      `email`, `ip`, and `created_at`.
 *   2. Before a credential check, count failed attempts in the last
 *      `WINDOW_MIN` minutes; if >= `LIMIT`, reject the attempt (return
 *      `locked: true`).
 *   3. On successful login, delete all `failed_logins` for that email.
 *
 * The lockout is per-email. The IP is recorded for forensic purposes and
 * could be used in a future per-IP policy.
 *
 * F-217 / PERF-007 — the read path is wrapped in `withDbRetry` so
 * transient pooler errors (P1001/P1017) get one retry before failing
 * open. The write paths are still best-effort.
 */

const WINDOW_MIN = 15
const LIMIT = 5

/**
 * Record a failed login attempt. Best-effort: errors are swallowed so a
 * DB hiccup never blocks a login response.
 */
export async function recordFailedLogin(opts: { email: string; ip: string; userId?: number }): Promise<void> {
  try {
    await withDbRetry(() =>
      prisma.failedLogin.create({
        data: { email: opts.email, ip: opts.ip, user_id: opts.userId ?? null },
      })
    )
    // Opportunistic prune of old rows (older than 1 hour) to keep the
    // table small.
    const cutoff = new Date(Date.now() - 60 * 60 * 1000)
    await withDbRetry(() =>
      prisma.failedLogin.deleteMany({ where: { created_at: { lt: cutoff } } })
    )
  } catch (err) {
    logger.error('recordFailedLogin failed', {
      err: (err as Error)?.message ?? String(err),
    })
  }
}

/**
 * Returns true if the email is currently locked out.
 */
export async function isLockedOut(email: string): Promise<boolean> {
  try {
    const cutoff = new Date(Date.now() - WINDOW_MIN * 60 * 1000)
    const count = await withDbRetry(() =>
      prisma.failedLogin.count({
        where: { email: email.toLowerCase(), created_at: { gte: cutoff } },
      })
    )
    return count >= LIMIT
  } catch (err) {
    logger.error('isLockedOut failed', {
      err: (err as Error)?.message ?? String(err),
    })
    // Fail open: if we cannot read the table, do not block the user.
    return false
  }
}

/**
 * Clear all failed-login records for an email (called on successful login).
 */
export async function clearFailedLogins(email: string): Promise<void> {
  try {
    await withDbRetry(() =>
      prisma.failedLogin.deleteMany({ where: { email: email.toLowerCase() } })
    )
  } catch (err) {
    logger.error('clearFailedLogins failed', {
      err: (err as Error)?.message ?? String(err),
    })
  }
}

/** Test-only helper: expose internal config for unit tests. */
export const _INTERNAL = { WINDOW_MIN, LIMIT }
