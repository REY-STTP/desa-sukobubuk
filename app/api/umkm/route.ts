import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clampLimit, clampPage } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const kategori = searchParams.get('kategori')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    // P1-B2: paginasi (sebelumnya seluruh tabel di-return) + clamp.
    // Shape disamakan dengan /api/berita: { data, total, page, totalPages }.
    const limit = clampLimit(searchParams.get('limit'))
    const page = clampPage(searchParams.get('page'))
    const skip = (page - 1) * limit
    const where = {
      ...(kategori && { kategori }),
      ...(featured === 'true' && { is_featured: true }),
      ...(search && {
        OR: [
          { nama_usaha: { contains: search, mode: 'insensitive' as const } },
          { pemilik: { contains: search, mode: 'insensitive' as const } },
          { deskripsi: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [umkm, total] = await Promise.all([
      prisma.uMKM.findMany({
        where,
        orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
        take: limit,
        skip,
        include: { _count: { select: { produk: true } } },
      }),
      prisma.uMKM.count({ where }),
    ])

    return NextResponse.json({ data: umkm, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
