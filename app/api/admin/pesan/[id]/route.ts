import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { parseBody } from '@/lib/parse-body'
import { pesanPatchSchema } from '@/lib/schemas/pesan'
import { prismaErrorResponse } from '@/lib/prisma-errors'
import { CACHE_TAGS } from '@/lib/cache'
import { logAdminAction, getClientIp } from '@/lib/audit'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id: idRaw } = await params
  const id = Number.parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const parsed = await parseBody(req, pesanPatchSchema)
  if (parsed instanceof NextResponse) return parsed

  try {
    const pesan = await prisma.pesan.update({
      where: { id },
      data: { is_read: Boolean(parsed.data.is_read) },
    })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'PATCH',
      entity: 'pesan',
      entityId: id,
      payload: { is_read: parsed.data.is_read },
      ip: getClientIp(req),
    })

    revalidateTag(CACHE_TAGS.pesan, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json(pesan)
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal update pesan')
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
    await prisma.pesan.delete({ where: { id } })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'DELETE',
      entity: 'pesan',
      entityId: id,
      ip: getClientIp(req),
    })

    revalidateTag(CACHE_TAGS.pesan, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal hapus pesan')
  }
}
