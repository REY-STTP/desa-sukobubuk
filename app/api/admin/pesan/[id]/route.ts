import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { CACHE_TAGS } from '@/lib/cache'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id: idRaw } = await params
  const id = Number.parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const body = await req.json()

  try {
    const pesan = await prisma.pesan.update({
      where: { id },
      data: { is_read: body.is_read },
    })

    revalidateTag(CACHE_TAGS.pesan, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(pesan)
  } catch {
    return NextResponse.json({ error: 'Gagal update pesan' }, { status: 500 })
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
    await prisma.pesan.delete({ where: { id } })

    revalidateTag(CACHE_TAGS.pesan, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus pesan' }, { status: 500 })
  }
}
