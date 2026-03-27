import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { judul, slug, konten, thumbnail } = body

    if (!judul || !konten) return NextResponse.json({ error: 'Judul dan konten wajib diisi' }, { status: 400 })

    const finalSlug = slug || slugify(judul)
    const existing = await prisma.berita.findUnique({ where: { slug: finalSlug } })
    if (existing) return NextResponse.json({ error: 'Slug sudah digunakan' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    const berita = await prisma.berita.create({
      data: { judul, slug: finalSlug, konten, thumbnail: thumbnail ?? null, author_id: user.id },
    })
    return NextResponse.json(berita, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal membuat berita' }, { status: 500 })
  }
}
