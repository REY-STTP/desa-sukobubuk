import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { detectImageType } from '@/lib/utils'
import { galeriCreateSchema } from '@/lib/schemas/galeri'
import { CACHE_TAGS } from '@/lib/cache'
import { logAdminAction, getClientIp } from '@/lib/audit'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const formData = await req.formData()
    const judulRaw = formData.get('judul')
    const foto = formData.get('foto') as File | null

    const judulParse = galeriCreateSchema.safeParse({ judul: judulRaw })
    if (!judulParse.success) {
      return NextResponse.json(
        { error: 'Judul wajib diisi', issues: judulParse.error.issues },
        { status: 400 }
      )
    }
    const judul = judulParse.data.judul

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
    // P1-B4: verifikasi magic bytes — MIME dari klien bisa dipalsu.
    const detectedFoto = detectImageType(buffer)
    if (!detectedFoto || !ALLOWED_TYPES.includes(detectedFoto)) {
      return NextResponse.json({ error: 'File bukan gambar JPG, PNG, atau WEBP yang valid' }, { status: 400 })
    }
    const { url } = await uploadToCloudinary(buffer, 'galeri', {
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    })

    const galeri = await prisma.galeri.create({
      data: { judul, foto: url },
    })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'CREATE',
      entity: 'galeri',
      entityId: galeri.id,
      payload: { judul },
      ip: getClientIp(req),
    })

    revalidateTag(CACHE_TAGS.galeri, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(galeri, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal upload foto' }, { status: 500 })
  }
}
