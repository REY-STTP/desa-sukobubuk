import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import type { Session } from 'next-auth'

/**
 * F-101: AUTH-001 — require an authenticated admin user.
 *
 * Returns either the session on success, or a ready-to-return NextResponse
 * on failure (401 if no session, 403 if the role is not 'admin').
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
  const session = await getServerSession(authOptions)
  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  // The `role` field is typed on Session in `types/next-auth.d.ts`.
  if (session.user?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { session }
}
