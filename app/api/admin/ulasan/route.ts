import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

// TASK-REV-01 — admin-only listing ulasan untuk moderasi.
// Tiru `app/api/admin/pesan/route.ts` (kontrak `{ data, page, limit, total,
// totalPages }`). Tidak ada konsumen JS internal untuk koleksi ini
// (halaman pakai RSC `getUlasanPage`), jadi shape ini aman.
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
  const q = (searchParams.get('q') ?? '').trim().slice(0, 100)
  const skip = (page - 1) * limit

  const where = q
    ? {
        OR: [
          { nama: { contains: q, mode: 'insensitive' as const } },
          { komentar: { contains: q, mode: 'insensitive' as const } },
          { produk: { nama_produk: { contains: q, mode: 'insensitive' as const } } },
        ],
      }
    : {}

  try {
    const [data, total] = await prisma.$transaction([
      prisma.ulasan.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        select: {
          id: true, nama: true, rating: true, komentar: true,
          is_approved: true, created_at: true, produk_id: true,
          produk: { select: { nama_produk: true, slug: true } },
        },
      }),
      prisma.ulasan.count({ where }),
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
