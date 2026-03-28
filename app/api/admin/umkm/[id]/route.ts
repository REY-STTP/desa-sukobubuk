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
    const { nama_usaha, slug, pemilik, kategori, deskripsi, alamat, whatsapp, is_featured, logo } = await req.json()
    const umkm = await prisma.uMKM.update({
      where: { id: parseInt(id) },
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
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    await prisma.uMKM.delete({ where: { id: parseInt(id) } })

    revalidateTag(CACHE_TAGS.umkm, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus UMKM' }, { status: 500 })
  }
}
