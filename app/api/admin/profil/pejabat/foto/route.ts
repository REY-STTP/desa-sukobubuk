import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('foto') as File | null

    if (!file) return NextResponse.json({ error: 'File foto tidak ditemukan' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: 'Format tidak didukung. Gunakan JPG, PNG, atau WEBP.' }, { status: 400 })
    if (file.size > 3 * 1024 * 1024)
      return NextResponse.json({ error: 'Ukuran file terlalu besar. Maksimal 3MB.' }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())

    // Cloudinary melakukan resize 400x400 crop & optimize — tidak perlu sharp lokal
    const { url: foto_url } = await uploadToCloudinary(buffer, 'pejabat', {
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' },
      ],
    })

    return NextResponse.json({ foto_url })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal upload foto' }, { status: 500 })
  }
}