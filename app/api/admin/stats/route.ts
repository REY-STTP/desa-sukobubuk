import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const [totalUMKM, totalProduk, totalBerita, totalGaleri, totalPesan, pesanBelumDibaca, pesanTerbaru] =
      await Promise.all([
        prisma.uMKM.count(),
        prisma.produk.count(),
        prisma.berita.count(),
        prisma.galeri.count(),
        prisma.pesan.count(),
        prisma.pesan.count({ where: { is_read: false } }),
        prisma.pesan.findMany({ take: 5, orderBy: { created_at: 'desc' } }),
      ])

    return NextResponse.json(
      { totalUMKM, totalProduk, totalBerita, totalGaleri, totalPesan, pesanBelumDibaca, pesanTerbaru },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e) {
    console.error('[stats] failed', e)
    return NextResponse.json({ error: 'Gagal memuat statistik' }, { status: 500 })
  }
}
