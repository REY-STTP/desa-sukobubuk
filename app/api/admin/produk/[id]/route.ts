import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { CACHE_TAGS } from '@/lib/cache'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id: idRaw } = await params
  const id = Number.parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  try {
    const { nama_produk, slug, deskripsi, harga, umkm_id, is_available, foto } = await req.json()
    const produk = await prisma.produk.update({
      where: { id },
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
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id: idRaw } = await params
  const id = Number.parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  try {
    await prisma.produk.delete({ where: { id } })

    revalidateTag(CACHE_TAGS.produk, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus produk' }, { status: 500 })
  }
}
