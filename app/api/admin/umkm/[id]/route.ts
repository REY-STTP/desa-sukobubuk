import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { parseBody } from '@/lib/parse-body'
import { umkmUpdateSchema } from '@/lib/schemas/umkm'
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
  const parsed = await parseBody(req, umkmUpdateSchema)
  if (parsed instanceof NextResponse) return parsed
  try {
    // P2-E2: baca logo + slug lama untuk cleanup bila diganti.
    const lama = await prisma.uMKM.findUnique({
      where: { id },
      select: { logo: true, slug: true },
    })
    if (!lama) return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    const data: Record<string, unknown> = { ...parsed.data }
    // Convert empty-string slugs to undefined so we don't try to write ''
    if (data.slug === '') delete data.slug
    if (data.kecamatan === '') (data as Record<string, unknown>).kecamatan = null
    else if (typeof data.kecamatan === 'string') (data as Record<string, unknown>).kecamatan = (data.kecamatan as string).trim() || null
    const umkm = await prisma.uMKM.update({ where: { id }, data })

    // Best-effort: hapus logo lama yang tergantikan & eksklusif.
    if (data.logo !== undefined && lama.logo && lama.logo !== data.logo) {
      await deleteUnusedCloudinaryUrl(lama.logo, () =>
        prisma.uMKM.findFirst({ where: { logo: lama.logo } }).then((r) => r !== null)
      )
    }

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'UPDATE',
      entity: 'umkm',
      entityId: id,
      payload: parsed.data,
      ip: getClientIp(req),
    })

    // P2-F1: `{ expire: 0 }` (bukan 'max') — stale konten tak boleh disajikan
    // untuk data yang baru saja dimutasi; request berikutnya blokir sampai
    // revalidasi selesai. Terbukti diuji: profil 'max' (SWR) tak kunjung
    // menyegarkan entri data di stack ini (lihat Hasil eksekusi TASK-P2).
    revalidateTag(CACHE_TAGS.umkm, { expire: 0 })
    revalidateTag(CACHE_TAGS.dashboard, { expire: 0 })

    // P2-F1: bila slug berubah, purge eksplisit halaman lama+baru (detail
    // UMKM + semua halaman produknya). Alasan: `revalidateTag(*, 'max')`
    // memakai semantik stale-while-revalidate — HTML statis basi bisa
    // tersaji lama; revalidatePath memaksa render segar di kunjungan
    // berikutnya (guard slug → 404 yang benar untuk URL lama).
    if (typeof data.slug === 'string' && data.slug !== lama.slug) {
      const produkSlugs = await prisma.produk.findMany({
        where: { umkm_id: id },
        select: { slug: true },
      })
      revalidatePath(`/umkm/${lama.slug}`)
      revalidatePath(`/umkm/${data.slug}`)
      for (const p of produkSlugs) {
        revalidatePath(`/umkm/${lama.slug}/produk/${p.slug}`)
        revalidatePath(`/umkm/${data.slug}/produk/${p.slug}`)
      }
    }

    return NextResponse.json(umkm)
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal update UMKM')
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
    // P2-E2: baca logo dulu agar bisa dibersihkan bila eksklusif.
    const row = await prisma.uMKM.findUnique({ where: { id }, select: { logo: true } })
    if (!row) return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    await prisma.uMKM.delete({ where: { id } })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'DELETE',
      entity: 'umkm',
      entityId: id,
      ip: getClientIp(req),
    })

    // Best-effort: hapus aset Cloudinary yang tak dipakai row lain.
    await deleteUnusedCloudinaryUrl(row.logo, () =>
      prisma.uMKM.findFirst({ where: { logo: row.logo } }).then((r) => r !== null)
    )

    revalidateTag(CACHE_TAGS.umkm, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal hapus UMKM')
  }
}
