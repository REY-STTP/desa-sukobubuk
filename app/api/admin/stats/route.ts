import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { toPesanSnippet } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const [totalUMKM, totalProduk, totalBerita, totalGaleri, totalPesan, pesanBelumDibaca, pesanTerbaruRows] =
      await Promise.all([
        prisma.uMKM.count(),
        prisma.produk.count(),
        prisma.berita.count(),
        prisma.galeri.count(),
        prisma.pesan.count(),
        prisma.pesan.count({ where: { is_read: false } }),
        // F1 (T-11): select eksplisit + cuplikan — tidak ada lagi
        // `SELECT *`/`isi_pesan` penuh di JSON stats. Route ini kini
        // jarang dihit (polling client dihapus, lihat DashboardLive);
        // dipertahankan untuk debug/inspeksi manual + didokumentasikan
        // di README.
        prisma.pesan.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          select: { id: true, nama: true, email: true, isi_pesan: true, is_read: true, created_at: true },
        }),
      ])
    const pesanTerbaru = pesanTerbaruRows.map(toPesanSnippet)

    return NextResponse.json(
      { totalUMKM, totalProduk, totalBerita, totalGaleri, totalPesan, pesanBelumDibaca, pesanTerbaru },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e) {
    console.error('[stats] failed', e)
    return NextResponse.json({ error: 'Gagal memuat statistik' }, { status: 500 })
  }
}
