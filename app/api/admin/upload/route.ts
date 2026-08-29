import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-guard'
import { uploadToCloudinary } from '@/lib/cloudinary'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FOLDERS = ['berita', 'umkm', 'produk']

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string | null

    if (!file) return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
    if (!folder || !ALLOWED_FOLDERS.includes(folder))
      return NextResponse.json({ error: 'Folder tidak valid' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: 'Format harus JPG, PNG, atau WEBP' }, { status: 400 })
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: 'Ukuran maksimal 5MB' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const { url } = await uploadToCloudinary(buffer, folder, {
      // Otomatis compress & konversi ke WebP oleh Cloudinary
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal upload gambar' }, { status: 500 })
  }
}