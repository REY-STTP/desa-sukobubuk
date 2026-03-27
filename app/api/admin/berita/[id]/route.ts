import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    const { judul, slug, konten, thumbnail } = await req.json()
    const berita = await prisma.berita.update({
      where: { id: parseInt(id) },
      data: { judul, slug, konten, thumbnail: thumbnail ?? null },
    })
    return NextResponse.json(berita)
  } catch {
    return NextResponse.json({ error: 'Gagal update berita' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  try {
    await prisma.berita.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus berita' }, { status: 500 })
  }
}
