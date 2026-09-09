import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clampLimit, clampPage } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const umkmIdRaw = searchParams.get('umkm_id')
    const available = searchParams.get('available')
    // P1-B2: umkm_id non-numerik → 400 (bukan NaN ke Prisma → 500).
    let umkmId: number | undefined
    if (umkmIdRaw !== null && umkmIdRaw !== '') {
      umkmId = parseInt(umkmIdRaw, 10)
      if (!Number.isFinite(umkmId)) {
        return NextResponse.json({ error: 'umkm_id tidak valid' }, { status: 400 })
      }
    }
    // P1-B2: paginasi agar konsisten dengan /api/berita (termasuk clamp).
    const limit = clampLimit(searchParams.get('limit'))
    const page = clampPage(searchParams.get('page'))
    const skip = (page - 1) * limit

    const [produk, total] = await Promise.all([
      prisma.produk.findMany({
        where: {
          ...(umkmId !== undefined && { umkm_id: umkmId }),
          ...(available === 'true' && { is_available: true }),
        },
        orderBy: { created_at: 'asc' },
        take: limit,
        skip,
        include: { umkm: { select: { nama_usaha: true, slug: true } } },
      }),
      prisma.produk.count({
        where: {
          ...(umkmId !== undefined && { umkm_id: umkmId }),
          ...(available === 'true' && { is_available: true }),
        },
      }),
    ])

    return NextResponse.json({ data: produk, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
