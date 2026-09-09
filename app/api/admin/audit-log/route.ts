import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

/**
 * ARCH-001 / F-109 — Admin audit log listing.
 * GET /api/admin/audit-log?page=1&entity=berita&action=CREATE&q=slug
 * Requires admin session. Returns paginated rows ordered by createdAt desc.
 */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { searchParams } = new URL(req.url)
  const pageRaw = searchParams.get('page') ?? '1'
  const entity = searchParams.get('entity')?.trim() || undefined
  const action = searchParams.get('action')?.trim() || undefined
  const q = searchParams.get('q')?.trim() || undefined

  const page = Math.max(1, Number.parseInt(pageRaw, 10) || 1)
  const take = 20
  const skip = (page - 1) * take

  const where: Record<string, unknown> = {}
  if (entity) (where as Record<string, string>).entity = entity
  if (action) (where as Record<string, string>).action = action
  if (q) {
    // Search in entityId, userEmail, action, entity via OR
    ;(where as Record<string, unknown>).OR = [
      { entityId: { contains: q, mode: 'insensitive' } },
      { userEmail: { contains: q, mode: 'insensitive' } },
      { action: { contains: q, mode: 'insensitive' } },
      { entity: { contains: q, mode: 'insensitive' } },
    ]
  }

  try {
    const [rows, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: where as never,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.auditLog.count({ where: where as never }),
    ])

    return NextResponse.json({
      data: rows,
      page,
      take,
      total,
      totalPages: Math.max(1, Math.ceil(total / take)),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Gagal memuat audit log' }, { status: 500 })
  }
}
