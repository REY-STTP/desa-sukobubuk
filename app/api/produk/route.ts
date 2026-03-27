import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const umkmId = searchParams.get('umkm_id')
    const available = searchParams.get('available')

    const produk = await prisma.produk.findMany({
      where: {
        ...(umkmId && { umkm_id: parseInt(umkmId) }),
        ...(available === 'true' && { is_available: true }),
      },
      orderBy: { created_at: 'asc' },
      include: { umkm: { select: { nama_usaha: true, slug: true } } },
    })

    return NextResponse.json(produk)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
