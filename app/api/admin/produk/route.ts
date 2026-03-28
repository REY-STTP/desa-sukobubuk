import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidateTag } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { CACHE_TAGS } from '@/lib/cache'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { nama_produk, slug, deskripsi, harga, umkm_id, is_available, foto } = body

    if (!nama_produk || !deskripsi || !harga || !umkm_id) {
      return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 })
    }

    const finalSlug = slug || slugify(nama_produk)
    const existing = await prisma.produk.findUnique({ where: { slug: finalSlug } })
    if (existing) return NextResponse.json({ error: 'Slug sudah digunakan' }, { status: 400 })

    const produk = await prisma.produk.create({
      data: { nama_produk, slug: finalSlug, deskripsi, harga, umkm_id: Number(umkm_id), foto: foto ?? null, is_available: is_available ?? true },
    })

    revalidateTag(CACHE_TAGS.produk, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(produk, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal membuat produk' }, { status: 500 })
  }
}
