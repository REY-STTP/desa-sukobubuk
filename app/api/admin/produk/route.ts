import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { requireAdmin } from '@/lib/admin-guard'
import { parseBody } from '@/lib/parse-body'
import { produkCreateSchema } from '@/lib/schemas/produk'
import { CACHE_TAGS } from '@/lib/cache'
import { prismaErrorResponse } from '@/lib/prisma-errors'
import { logAdminAction, getClientIp } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const parsed = await parseBody(req, produkCreateSchema)
  if (parsed instanceof NextResponse) return parsed
  const { nama_produk, slug, deskripsi, harga, umkm_id, is_available, foto } = parsed.data

  try {
    const finalSlug = slug || slugify(nama_produk)
    // P2-E1: tolak slug kosong hasil slugify (bukan P2002 → 500).
    if (!finalSlug) {
      return NextResponse.json({ error: 'Slug tidak valid dari nama produk' }, { status: 400 })
    }
    // P2-E1: pastikan UMKM ada (bukan P2003 → 500).
    const umkmAda = await prisma.uMKM.findUnique({
      where: { id: umkm_id },
      select: { id: true },
    })
    if (!umkmAda) {
      return NextResponse.json({ error: 'UMKM tidak ditemukan' }, { status: 404 })
    }
    const existing = await prisma.produk.findUnique({ where: { slug: finalSlug } })
    if (existing) return NextResponse.json({ error: 'Slug sudah digunakan' }, { status: 400 })

    const produk = await prisma.produk.create({
      data: {
        nama_produk,
        slug: finalSlug,
        deskripsi,
        harga,
        umkm_id,
        foto: foto ?? null,
        is_available: is_available !== false,
      },
    })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'CREATE',
      entity: 'produk',
      entityId: produk.id,
      payload: { nama_produk, slug: finalSlug, umkm_id },
      ip: getClientIp(req),
    })

    revalidateTag(CACHE_TAGS.produk, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(produk, { status: 201 })
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal membuat produk')
  }
}
