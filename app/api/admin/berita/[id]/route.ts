import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { sanitizeRichText } from '@/lib/sanitize'
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
    const { judul, slug, konten, thumbnail } = await req.json()
    const berita = await prisma.berita.update({
      where: { id },
      data: {
        judul,
        slug,
        konten: sanitizeRichText(konten),
        thumbnail: thumbnail ?? null,
      },
    })

    revalidateTag(CACHE_TAGS.berita, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(berita)
  } catch {
    return NextResponse.json({ error: 'Gagal update berita' }, { status: 500 })
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
    await prisma.berita.delete({ where: { id } })

    revalidateTag(CACHE_TAGS.berita, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus berita' }, { status: 500 })
  }
}
