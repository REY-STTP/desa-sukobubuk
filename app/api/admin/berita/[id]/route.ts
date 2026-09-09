import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { sanitizeRichText } from '@/lib/sanitize'
import { requireAdmin } from '@/lib/admin-guard'
import { parseBody } from '@/lib/parse-body'
import { beritaUpdateSchema } from '@/lib/schemas/berita'
import { prismaErrorResponse } from '@/lib/prisma-errors'
import { deleteUnusedCloudinaryUrl } from '@/lib/cloudinary'
import { CACHE_TAGS } from '@/lib/cache'
import { logAdminAction, getClientIp } from '@/lib/audit'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id: idRaw } = await params
  const id = Number.parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const parsed = await parseBody(req, beritaUpdateSchema)
  if (parsed instanceof NextResponse) return parsed
  const { judul, slug, konten, thumbnail } = parsed.data
  try {
    // P2-E2: baca thumbnail lama untuk cleanup bila diganti.
    const lama = await prisma.berita.findUnique({ where: { id }, select: { thumbnail: true } })
    if (!lama) return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    const data: Record<string, unknown> = {}
    if (judul !== undefined) data.judul = judul
    if (slug !== undefined) data.slug = slug
    if (konten !== undefined) data.konten = sanitizeRichText(konten)
    if (thumbnail !== undefined) data.thumbnail = thumbnail
    const berita = await prisma.berita.update({ where: { id }, data })

    // Best-effort: hapus thumbnail lama yang tergantikan & eksklusif.
    if (thumbnail !== undefined && lama.thumbnail && lama.thumbnail !== thumbnail) {
      await deleteUnusedCloudinaryUrl(lama.thumbnail, () =>
        prisma.berita
          .findFirst({ where: { thumbnail: lama.thumbnail } })
          .then((r) => r !== null)
      )
    }

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'UPDATE',
      entity: 'berita',
      entityId: id,
      payload: { judul, slug },
      ip: getClientIp(req),
    })

    revalidateTag(CACHE_TAGS.berita, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(berita)
  } catch (error) {
    // P2-E1: P2025 → 404, P2002 → 409 (bukan 500 generik).
    return prismaErrorResponse(error, 'Gagal update berita')
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id: idRaw } = await params
  const id = Number.parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  try {
    // P2-E2: baca thumbnail dulu agar bisa dibersihkan bila eksklusif.
    const row = await prisma.berita.findUnique({ where: { id }, select: { thumbnail: true } })
    if (!row) return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    await prisma.berita.delete({ where: { id } })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'DELETE',
      entity: 'berita',
      entityId: id,
      ip: getClientIp(req),
    })

    // Best-effort: hapus aset Cloudinary yang tak dipakai row lain.
    await deleteUnusedCloudinaryUrl(row.thumbnail, () =>
      prisma.berita
        .findFirst({ where: { thumbnail: row.thumbnail } })
        .then((r) => r !== null)
    )

    revalidateTag(CACHE_TAGS.berita, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal hapus berita')
  }
}
