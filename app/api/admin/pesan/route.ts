import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

/**
 * F-107: API-002 — admin-only listing of incoming `Pesan` (contact form) rows.
 *
 * Previously this was exposed unauthenticated at `/api/pesan` GET, which
 * leaked warga PII. It now requires an authenticated admin session.
 */
export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const pesan = await prisma.pesan.findMany({
      orderBy: { created_at: 'desc' },
    })
    return NextResponse.json(pesan)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
