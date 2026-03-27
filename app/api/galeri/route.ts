import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const galeri = await prisma.galeri.findMany({
      orderBy: { created_at: 'desc' },
    })
    return NextResponse.json(galeri)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
