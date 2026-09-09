import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { requireAdmin } from '@/lib/admin-guard'
import { parseBody } from '@/lib/parse-body'
import { umkmCreateSchema } from '@/lib/schemas/umkm'
import { CACHE_TAGS } from '@/lib/cache'
import { prismaErrorResponse } from '@/lib/prisma-errors'
import { logAdminAction, getClientIp } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const parsed = await parseBody(req, umkmCreateSchema)
  if (parsed instanceof NextResponse) return parsed
  const { nama_usaha, slug, pemilik, kategori, deskripsi, alamat, kecamatan, whatsapp, is_featured, logo } = parsed.data as typeof parsed.data & { kecamatan?: string }

  try {
    const finalSlug = slug || slugify(nama_usaha)
    // P2-E1: tolak slug kosong hasil slugify (bukan P2002 → 500).
    if (!finalSlug) {
      return NextResponse.json({ error: 'Slug tidak valid dari nama usaha' }, { status: 400 })
    }
    const existing = await prisma.uMKM.findUnique({ where: { slug: finalSlug } })
    if (existing) return NextResponse.json({ error: 'Slug sudah digunakan, ubah nama usaha' }, { status: 400 })

    const umkm = await prisma.uMKM.create({
      data: {
        nama_usaha,
        slug: finalSlug,
        pemilik,
        kategori,
        deskripsi,
        alamat,
        kecamatan: kecamatan?.trim() || null,
        whatsapp,
        logo: logo ?? null,
        is_featured: is_featured === true,
      },
    })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'CREATE',
      entity: 'umkm',
      entityId: umkm.id,
      payload: { nama_usaha, slug: finalSlug },
      ip: getClientIp(req),
    })

    revalidateTag(CACHE_TAGS.umkm, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(umkm, { status: 201 })
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal membuat UMKM')
  }
}
