import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const kategori = searchParams.get('kategori')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const umkm = await prisma.uMKM.findMany({
      where: {
        ...(kategori && { kategori }),
        ...(featured === 'true' && { is_featured: true }),
        ...(search && {
          OR: [
            { nama_usaha: { contains: search, mode: 'insensitive' } },
            { pemilik: { contains: search, mode: 'insensitive' } },
            { deskripsi: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
      include: { _count: { select: { produk: true } } },
    })

    return NextResponse.json(umkm)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
