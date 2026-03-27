import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const [berita, total] = await Promise.all([
      prisma.berita.findMany({
        orderBy: { created_at: 'desc' },
        take: limit,
        skip,
        include: { author: { select: { name: true } } },
      }),
      prisma.berita.count(),
    ])

    return NextResponse.json({ data: berita, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
