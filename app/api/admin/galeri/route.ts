import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { CACHE_TAGS } from '@/lib/cache'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const formData = await req.formData()
    const judul = formData.get('judul') as string | null
    const foto = formData.get('foto') as File | null

    if (!judul) return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 })
    if (!foto) return NextResponse.json({ error: 'Foto wajib diupload' }, { status: 400 })

    if (foto.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran foto maksimal 5MB' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(foto.type)) {
      return NextResponse.json({ error: 'Format foto harus JPG, PNG, atau WEBP' }, { status: 400 })
    }

    // F-104: switch from local filesystem to Cloudinary so the upload survives
    // Vercel's read-only filesystem and ephemeral deployments.
    const buffer = Buffer.from(await foto.arrayBuffer())
    const { url } = await uploadToCloudinary(buffer, 'galeri', {
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    })

    const galeri = await prisma.galeri.create({
      data: { judul, foto: url },
    })

    revalidateTag(CACHE_TAGS.galeri, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(galeri, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal upload foto' }, { status: 500 })
  }
}
