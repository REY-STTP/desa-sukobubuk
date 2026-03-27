import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus produk' }, { status: 500 })
  }
}
