import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { detectImageType } from '@/lib/utils'
import { logAdminAction, getClientIp } from '@/lib/audit'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const formData = await req.formData()
    const file = formData.get('foto') as File | null

    if (!file) return NextResponse.json({ error: 'File foto tidak ditemukan' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: 'Format tidak didukung. Gunakan JPG, PNG, atau WEBP.' }, { status: 400 })
    if (file.size > 3 * 1024 * 1024)
      return NextResponse.json({ error: 'Ukuran file terlalu besar. Maksimal 3MB.' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    // P1-B4: verifikasi magic bytes — MIME dari klien bisa dipalsu.
    const detectedFoto = detectImageType(buffer)
    if (!detectedFoto || !ALLOWED_TYPES.includes(detectedFoto))
      return NextResponse.json({ error: 'File bukan gambar JPG, PNG, atau WEBP yang valid' }, { status: 400 })

    // Cloudinary melakukan resize 400x400 crop & optimize — tidak perlu sharp lokal
    const { url: foto_url } = await uploadToCloudinary(buffer, 'pejabat', {
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' },
      ],
    })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'UPLOAD',
      entity: 'pejabat',
      payload: { foto_url },
      ip: getClientIp(req),
    })

    return NextResponse.json({ foto_url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal upload foto' }, { status: 500 })
  }
}