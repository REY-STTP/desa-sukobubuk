import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { pejabat } = await req.json()

    // Hapus semua lalu buat ulang (replace strategy)
    await prisma.pejabatDesa.deleteMany()
    await prisma.pejabatDesa.createMany({
      data: pejabat.map((p: any, i: number) => ({
        jabatan: p.jabatan,
        nama: p.nama,
        kategori: p.kategori,
        urutan: i + 1,
        foto_url: p.foto_url ?? null,
      })),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menyimpan pejabat' }, { status: 500 })
  }
}