import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * F-218: API-004 — public health endpoint.
 *
 * Returns 200 with `{ ok: true, db: 'ok' }` when the database is reachable,
 * 503 with `{ ok: false, db: 'down' }` when it is not. Intentionally
 * `Cache-Control: no-store` so uptime monitors always hit the DB.
 */
async function checkDb(): Promise<'ok' | 'down'> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return 'ok'
  } catch {
    return 'down'
  }
}

export async function GET() {
  const db = await checkDb()
  const status = db === 'ok' ? 200 : 503
  return NextResponse.json(
    { ok: db === 'ok', db },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
