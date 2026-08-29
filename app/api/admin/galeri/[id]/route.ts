import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { deleteFromCloudinary, getPublicIdFromUrl } from '@/lib/cloudinary'
import { CACHE_TAGS } from '@/lib/cache'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const { id: idRaw } = await params
  const id = Number.parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  try {
    // Look up the row first so we can attempt to delete the underlying file.
    const row = await prisma.galeri.findUnique({ where: { id } })
    await prisma.galeri.delete({ where: { id } })

    // Best-effort: remove the underlying Cloudinary asset.
    if (row?.foto) {
      const publicId = getPublicIdFromUrl(row.foto)
      if (publicId) await deleteFromCloudinary(publicId)
    }

    revalidateTag(CACHE_TAGS.galeri, 'max')
    revalidateTag(CACHE_TAGS.dashboard, 'max')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus foto' }, { status: 500 })
  }
}
