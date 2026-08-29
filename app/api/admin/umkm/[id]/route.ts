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
    const { nama_usaha, slug, pemilik, kategori, deskripsi, alamat, whatsapp, is_featured, logo } = await req.json()
    const umkm = await prisma.uMKM.update({
      where: { id },
      data: { nama_usaha, slug, pemilik, kategori, deskripsi, alamat, whatsapp, logo: logo ?? null, is_featured },
    })

    revalidateTag(CACHE_TAGS.umkm, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(umkm)
  } catch {
    return NextResponse.json({ error: 'Gagal update UMKM' }, { status: 500 })
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
    await prisma.uMKM.delete({ where: { id } })

    revalidateTag(CACHE_TAGS.umkm, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus UMKM' }, { status: 500 })
  }
}
