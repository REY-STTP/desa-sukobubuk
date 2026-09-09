import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { clampLimit, clampPage } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    // P1-B2: clamp agar ?limit=abc / ?limit=1000000 / ?page=-5 tak jadi 500/DoS.
    const limit = clampLimit(searchParams.get('limit'))
    const page = clampPage(searchParams.get('page'))
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
