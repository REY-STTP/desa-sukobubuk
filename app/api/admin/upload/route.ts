import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/admin-guard'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { detectImageType } from '@/lib/utils'
import { logAdminAction, getClientIp } from '@/lib/audit'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FOLDERS = ['berita', 'umkm', 'produk'] as const

const folderSchema = z.enum(ALLOWED_FOLDERS)

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folderRaw = formData.get('folder')

    const folderParse = folderSchema.safeParse(folderRaw)
    if (!folderParse.success) {
      return NextResponse.json({ error: 'Folder tidak valid' }, { status: 400 })
    }
    const folder = folderParse.data

    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: 'Format harus JPG, PNG, atau WEBP' }, { status: 400 })
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: 'Ukuran maksimal 5MB' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    // P1-B4: verifikasi magic bytes — MIME `file.type` dari klien bisa dipalsu.
    const detected = detectImageType(buffer)
    if (!detected || !ALLOWED_TYPES.includes(detected))
      return NextResponse.json({ error: 'File bukan gambar JPG, PNG, atau WEBP yang valid' }, { status: 400 })
    const { url } = await uploadToCloudinary(buffer, folder, {
      // Otomatis compress & konversi ke WebP oleh Cloudinary
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'UPLOAD',
      entity: 'upload',
      payload: { folder, url },
      ip: getClientIp(req),
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal upload gambar' }, { status: 500 })
  }
}