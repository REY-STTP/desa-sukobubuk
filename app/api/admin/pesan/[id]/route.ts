import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidateTag } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CACHE_TAGS } from '@/lib/cache'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  try {
    const pesan = await prisma.pesan.update({
      where: { id: parseInt(id) },
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
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  try {
    await prisma.pesan.delete({ where: { id: parseInt(id) } })

    revalidateTag(CACHE_TAGS.pesan, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus pesan' }, { status: 500 })
  }
}
