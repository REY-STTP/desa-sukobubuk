import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nama, email, isi_pesan } = body

    if (!nama || !email || !isi_pesan) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 })
    }

    const pesan = await prisma.pesan.create({
      data: { nama, email, isi_pesan },
    })

    return NextResponse.json({ success: true, data: pesan }, { status: 201 })
  } catch (error) {
    console.error('Error creating pesan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const pesan = await prisma.pesan.findMany({
      orderBy: { created_at: 'desc' },
    })
    return NextResponse.json(pesan)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
