import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { Role } from '@prisma/client'
import type { Session } from 'next-auth'

/**
 * F-101: AUTH-001 — require an authenticated admin user.
 *
 * Returns either the session on success, or a ready-to-return NextResponse
 * on failure (401 if no session, 403 if the role is not ADMIN).
 *
 * Usage:
 *   const guard = await requireAdmin()
 *   if ('error' in guard) return guard.error
 *   // ... proceed with `guard.session`
 */
export type AdminGuard =
  | { session: Session }
  | { error: NextResponse }

export async function requireAdmin(): Promise<AdminGuard> {
  const session = await auth()
  // P0-1: tolak sesi tanpa id. Token yang di-revoke (logout, hapus user,
  // force-revoke, bump session_version) tiba di sini sebagai sesi "racun"
  // `{ id: '', role: 'ADMIN' }` — tanpa cek ini, sesi tersebut lolos karena
  // role-nya masih ADMIN. Cek `!session` saja TIDAK cukup.
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  // F-208 / DB-004 (Phase 06) — `role` is now a Prisma enum, not a
  // free-form string. Currently only Role.ADMIN is in use, so the
  // comparison is constant but future-proof.
  if (session.user?.role !== Role.ADMIN) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { session }
}
