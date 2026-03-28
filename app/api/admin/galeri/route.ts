import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidateTag } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { CACHE_TAGS } from '@/lib/cache'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const judul = formData.get('judul') as string
    const foto = formData.get('foto') as File

    if (!judul) return NextResponse.json({ error: 'Judul wajib diisi' }, { status: 400 })
    if (!foto) return NextResponse.json({ error: 'Foto wajib diupload' }, { status: 400 })

    if (foto.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Ukuran foto maksimal 5MB' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(foto.type)) {
      return NextResponse.json({ error: 'Format foto harus JPG, PNG, atau WEBP' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = foto.name.split('.').pop()
    const fileName = `galeri-${Date.now()}.${ext}`
    const filePath = path.join(uploadDir, fileName)

    const bytes = await foto.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    const galeri = await prisma.galeri.create({
      data: { judul, foto: `/uploads/${fileName}` },
    })

    revalidateTag(CACHE_TAGS.galeri, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(galeri, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal upload foto' }, { status: 500 })
  }
}
