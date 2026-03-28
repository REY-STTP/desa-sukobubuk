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
    const { nama_usaha, slug, pemilik, kategori, deskripsi, alamat, whatsapp, is_featured, logo } = body

    if (!nama_usaha || !pemilik || !deskripsi || !alamat || !whatsapp) {
      return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 })
    }

    const finalSlug = slug || slugify(nama_usaha)
    const existing = await prisma.uMKM.findUnique({ where: { slug: finalSlug } })
    if (existing) return NextResponse.json({ error: 'Slug sudah digunakan, ubah nama usaha' }, { status: 400 })

    const umkm = await prisma.uMKM.create({
      data: { nama_usaha, slug: finalSlug, pemilik, kategori, deskripsi, alamat, whatsapp, logo: logo ?? null, is_featured: is_featured ?? false },
    })

    revalidateTag(CACHE_TAGS.umkm, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(umkm, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal membuat UMKM' }, { status: 500 })
  }
}
