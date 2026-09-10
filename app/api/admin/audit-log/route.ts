import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { AUDIT_LOG_TAKE, AUDIT_LOG_MAX_PAGE, buildAuditLogWhere } from '@/lib/cache'

/**
 * ARCH-001 / F-109 — Admin audit log listing.
 * GET /api/admin/audit-log?page=1&entity=berita&action=CREATE&q=slug
 * Requires admin session. Returns paginated rows ordered by createdAt desc.
 *
 * F2-Fase3 / T-32: where + clamp disamakan dengan halaman via
 * `buildAuditLogWhere` (satu helper, tak lagi duplikat). Kontrak respons
 * dipertahankan (baris penuh termasuk payload — data API opt-in,
 * paginasi 20, payload write-cap 10 KB).
 */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { searchParams } = new URL(req.url)
  const page = Math.min(
    AUDIT_LOG_MAX_PAGE,
    Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
  )
  const entity = searchParams.get('entity')?.trim() || undefined
  const action = searchParams.get('action')?.trim() || undefined
  const q = searchParams.get('q')?.trim() || undefined

  const take = AUDIT_LOG_TAKE
  const skip = (page - 1) * take
  const where = buildAuditLogWhere(q ?? '', entity, action)

  try {
    const [rows, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.auditLog.count({ where }),
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
