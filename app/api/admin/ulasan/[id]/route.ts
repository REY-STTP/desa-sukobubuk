import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { parseBody } from '@/lib/parse-body'
import { ulasanPatchSchema } from '@/lib/schemas/ulasan'
import { prismaErrorResponse } from '@/lib/prisma-errors'
import { CACHE_TAGS } from '@/lib/cache'
import { logAdminAction, getClientIp } from '@/lib/audit'

// TASK-REV-01 — moderasi ulasan. Tiru `app/api/admin/pesan/[id]/route.ts`:
// PATCH setujui/tahan + DELETE hapus, audit best-effort, lalu
// `revalidateTag('produk')` agar HTML + JSON-LD halaman produk segar
// (ulasan tampil di halaman yang di-tag `produk`).

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id: idRaw } = await params
  const id = Number.parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const parsed = await parseBody(req, ulasanPatchSchema)
  if (parsed instanceof NextResponse) return parsed

  try {
    const ulasan = await prisma.ulasan.update({
      where: { id },
      data: { is_approved: Boolean(parsed.data.is_approved) },
    })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'PATCH',
      entity: 'ulasan',
      entityId: id,
      payload: { is_approved: parsed.data.is_approved },
      ip: getClientIp(req),
    })

    revalidateTag(CACHE_TAGS.produk, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(ulasan)
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal update ulasan')
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
    await prisma.ulasan.delete({ where: { id } })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'DELETE',
      entity: 'ulasan',
      entityId: id,
      ip: getClientIp(req),
    })

    revalidateTag(CACHE_TAGS.produk, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal hapus ulasan')
  }
}
