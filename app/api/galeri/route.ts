import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CACHE_TAGS } from '@/lib/cache'
import { unstable_cache } from 'next/cache'

/**
 * F2-Fase3 / T-31: paginasi + cache. Sebelumnya `findMany` tanpa batas =
 * full table `SELECT *` tiap hit. Tidak ada konsumen `fetch` internal
 * (galeri publik dirender via RSC), sehingga kontrak diubah aman dari
 * array → `{ data, page, limit, total, totalPages }`.
 */
const DEFAULT_LIMIT = 12
const MAX_LIMIT = 50

const getGaleriPublik = (page: number, limit: number) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * limit
      const [data, total] = await prisma.$transaction([
        prisma.galeri.findMany({
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
        prisma.galeri.count(),
      ])
      return { data, total, totalPages: Math.max(1, Math.ceil(total / limit)) }
    },
    ['galeri-publik', String(page), String(limit)],
    { revalidate: 300, tags: [CACHE_TAGS.galeri] }
  )()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, Number.parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT)
    )
    const { data, total, totalPages } = await getGaleriPublik(page, limit)
    return NextResponse.json({ data, page, limit, total, totalPages })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
