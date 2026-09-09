import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { parseBody } from '@/lib/parse-body'
import { produkUpdateSchema } from '@/lib/schemas/produk'
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
  const parsed = await parseBody(req, produkUpdateSchema)
  if (parsed instanceof NextResponse) return parsed
  try {
    // P2-E2: baca foto lama untuk cleanup bila diganti.
    const lama = await prisma.produk.findUnique({ where: { id }, select: { foto: true } })
    if (!lama) return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    const data: Record<string, unknown> = { ...parsed.data }
    if (data.slug === '') delete data.slug
    const produk = await prisma.produk.update({ where: { id }, data })

    // Best-effort: hapus foto lama yang tergantikan & eksklusif.
    if (data.foto !== undefined && lama.foto && lama.foto !== data.foto) {
      await deleteUnusedCloudinaryUrl(lama.foto, () =>
        prisma.produk.findFirst({ where: { foto: lama.foto } }).then((r) => r !== null)
      )
    }

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'UPDATE',
      entity: 'produk',
      entityId: id,
      payload: parsed.data,
      ip: getClientIp(req),
    })

    revalidateTag(CACHE_TAGS.produk, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(produk)
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal update produk')
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
    // P2-E2: baca foto dulu agar bisa dibersihkan bila eksklusif.
    const row = await prisma.produk.findUnique({ where: { id }, select: { foto: true } })
    if (!row) return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    await prisma.produk.delete({ where: { id } })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'DELETE',
      entity: 'produk',
      entityId: id,
      ip: getClientIp(req),
    })

    // Best-effort: hapus aset Cloudinary yang tak dipakai row lain.
    await deleteUnusedCloudinaryUrl(row.foto, () =>
      prisma.produk.findFirst({ where: { foto: row.foto } }).then((r) => r !== null)
    )

    revalidateTag(CACHE_TAGS.produk, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal hapus produk')
  }
}
