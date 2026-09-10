import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

/**
 * F-107: API-002 — admin-only listing of incoming `Pesan` (contact form) rows.
 *
 * Previously this was exposed unauthenticated at `/api/pesan` GET, which
 * leaked warga PII. It now requires an authenticated admin session.
 *
 * F2-Fase3 / T-31: paginasi + proyeksi kolom. Sebelumnya `findMany` tanpa
 * batas = full table + `isi_pesan` penuh per baris. Tidak ada konsumen
 * JS internal untuk koleksi ini (halaman pakai RSC `getPesanPage`,
 * tombol tandai-baca pakai `/api/admin/pesan/[id]`) sehingga kontrak
 * diubah aman dari array → `{ data, page, limit, total, totalPages }`.
 */
const DEFAULT_LIMIT = 15
const MAX_LIMIT = 50

export async function GET(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
  )
  const skip = (page - 1) * limit

  try {
    const [data, total] = await prisma.$transaction([
      prisma.pesan.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        select: { id: true, nama: true, email: true, isi_pesan: true, is_read: true, created_at: true },
      }),
      prisma.pesan.count(),
    ])
    return NextResponse.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
