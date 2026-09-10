/**
 * ARCH-001 / F-109 (Phase 06) — Admin audit log.
 *
 * Every mutating admin route calls `logAdminAction()` after a successful
 * write. The function is best-effort: it never throws, so a logging
 * failure does not roll back the primary mutation.
 *
 * Payloads must never contain raw passwords/tokens — callers must redact.
 * Retention: delete rows older than 90 days via cron or manual query.
 */

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'PATCH' | 'UPLOAD' | string
export type AuditEntity =
  | 'berita'
  | 'umkm'
  | 'produk'
  | 'galeri'
  | 'pesan'
  | 'profil'
  | 'pejabat'
  | 'pengaturan'
  | 'upload'
  | 'auth'
  | string

export interface AuditParams {
  userId?: number | string | null
  userEmail?: string | null
  action: AuditAction
  entity: AuditEntity
  entityId?: string | number | null
  payload?: unknown
  ip?: string | null
}

/**
 * Best-effort audit write. Never throws.
 * `payload` is JSON-serialized; keep it small (< 10 KB) and redacted.
 */
export async function logAdminAction(params: AuditParams): Promise<void> {
  const { userId, userEmail, action, entity, entityId, payload, ip } = params

  // Normalize userId to number | null
  let uid: number | null = null
  if (userId != null) {
    const n = typeof userId === 'string' ? Number.parseInt(userId, 10) : userId
    if (Number.isFinite(n) && n > 0) uid = n
  }

  // Truncate payload if too large
  let safePayload: unknown = payload ?? null
  if (safePayload != null) {
    try {
      const s = JSON.stringify(safePayload)
      if (s.length > 10_000) safePayload = { _truncated: true, _len: s.length }
    } catch {
      safePayload = null
    }
  }

  try {
    await prisma.auditLog.create({
      data: {
        userId: uid,
        userEmail: userEmail ?? null,
        action,
        entity,
        entityId: entityId != null ? String(entityId) : null,
        payload: safePayload as never,
        ip: ip ?? null,
      },
    })
    // F2-Fase3 / T-32 — segarkan list audit-log ter-cache (60s). Di dalam
    // try/catch sendiri: kontrak best-effort (never throws) tidak boleh
    // jebol bila dipanggil di luar konteks request Next.
    try {
      const { revalidateTag } = await import('next/cache')
      const { CACHE_TAGS } = await import('@/lib/cache')
      // Profil 'max' (SWR) seperti mayoritas route mutasi — cukup karena
      // list audit-log juga ter-cache 60s dan tulis selalu menginvalidasi.
      revalidateTag(CACHE_TAGS.auditLog, 'max')
    } catch {
      // abaikan — TTL 60s tetap membatasi basi.
    }
  } catch (err) {
    // Best-effort: log but do not fail the caller.
    logger.error('audit log write failed', {
      action,
      entity,
      entityId: entityId != null ? String(entityId) : undefined,
      err: (err as Error)?.message ?? String(err),
    })
  }
}

/**
 * Extract client IP from a NextRequest. Prefers `x-forwarded-for`.
 * Safe when `req` is undefined (as in some unit tests where DELETE is
 * invoked with `undefined` as the request argument).
 */
export function getClientIp(
  req?: { headers?: { get?(name: string): string | null } } | null
): string | null {
  try {
    const h = req?.headers
    if (!h?.get) return null
    const fwd = h.get('x-forwarded-for')
    if (fwd) return fwd.split(',')[0]?.trim() ?? null
    const real = h.get('x-real-ip')
    if (real) return real.trim()
    return null
  } catch {
    return null
  }
}
