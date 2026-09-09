import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { sanitizeRichText } from '@/lib/sanitize'
import { requireAdmin } from '@/lib/admin-guard'
import { parseBody } from '@/lib/parse-body'
import { beritaCreateSchema } from '@/lib/schemas/berita'
import { prismaErrorResponse } from '@/lib/prisma-errors'
import { CACHE_TAGS } from '@/lib/cache'
import { logAdminAction, getClientIp } from '@/lib/audit'

export async function POST(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error
  const { session } = guard

  const parsed = await parseBody(req, beritaCreateSchema)
  if (parsed instanceof NextResponse) return parsed
  const { judul, slug, konten, thumbnail } = parsed.data

  try {
    const finalSlug = slug || slugify(judul)
    // P2-E1: judul seperti "!!!" menghasilkan slug "" — tolak dini (400),
    // jangan biarkan findUnique({slug:""}) + P2002 → 500.
    if (!finalSlug) {
      return NextResponse.json({ error: 'Slug tidak valid dari judul' }, { status: 400 })
    }
    const existing = await prisma.berita.findUnique({ where: { slug: finalSlug } })
    if (existing) return NextResponse.json({ error: 'Slug sudah digunakan' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    const berita = await prisma.berita.create({
      data: {
        judul,
        slug: finalSlug,
        konten: sanitizeRichText(konten),
        thumbnail: thumbnail ?? null,
        author_id: user.id,
      },
    })

    await logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      action: 'CREATE',
      entity: 'berita',
      entityId: berita.id,
      payload: { judul, slug: finalSlug },
      ip: getClientIp(req),
    })

    revalidateTag(CACHE_TAGS.berita, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(berita, { status: 201 })
  } catch (error) {
    // P2-E1: race slug duplikat → 409 (bukan 500).
    return prismaErrorResponse(error, 'Gagal membuat berita')
  }
}
