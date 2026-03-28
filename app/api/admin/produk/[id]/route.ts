import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidateTag } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CACHE_TAGS } from '@/lib/cache'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const { nama_produk, slug, deskripsi, harga, umkm_id, is_available, foto } = await req.json()
    const produk = await prisma.produk.update({
      where: { id: parseInt(id) },
      data: { nama_produk, slug, deskripsi, harga, umkm_id: Number(umkm_id), foto: foto ?? null, is_available },
    })

    revalidateTag(CACHE_TAGS.produk, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(produk)
  } catch {
    return NextResponse.json({ error: 'Gagal update produk' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await prisma.produk.delete({ where: { id: parseInt(id) } })

    revalidateTag(CACHE_TAGS.produk, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus produk' }, { status: 500 })
  }
}
