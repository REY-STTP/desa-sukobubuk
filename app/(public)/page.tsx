import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import FeaturedUMKM from '@/components/sections/FeaturedUMKM'
import LatestBerita from '@/components/sections/LatestBerita'
import GaleriSection from '@/components/sections/GaleriSection'
import CTASection from '@/components/sections/CTASection'
import StatsSection from '@/components/sections/StatsSection'
import { prisma } from '@/lib/prisma'
import { getHomeData } from '@/lib/cache'

export const metadata: Metadata = {
  title: 'Beranda',
}

// Hindari static prerender — halaman ini banyak query DB
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Graceful degradation: DB down = tampilkan homepage dengan data kosong, bukan 500
  const [homeData, profilResult, umkmCountResult, produkCountResult] =
    await Promise.allSettled([
      getHomeData(),
      prisma.profilDesa.findFirst({
        select: { jumlah_penduduk: true, tahun_berdiri: true },
      }),
      prisma.uMKM.count(),
      prisma.produk.count(),
    ])

  const home =
    homeData.status === 'fulfilled'
      ? homeData.value
      : { umkmFeatured: [], beritaTerbaru: [], galeri: [] }

  const profil =
    profilResult.status === 'fulfilled' ? profilResult.value : null

  const totalUMKM =
    umkmCountResult.status === 'fulfilled' ? umkmCountResult.value : 0

  const totalProduk =
    produkCountResult.status === 'fulfilled' ? produkCountResult.value : 0

  return (
    <>
      <HeroSection />
      <StatsSection
        totalUMKM={totalUMKM}
        totalProduk={totalProduk}
        totalPenduduk={profil?.jumlah_penduduk ?? 0}
        tahunBerdiri={
          profil?.tahun_berdiri
            ? Number.parseInt(String(profil.tahun_berdiri), 10) || 0
            : 0
        }
      />
      <FeaturedUMKM umkm={home.umkmFeatured} />
      <LatestBerita berita={home.beritaTerbaru} />
      <GaleriSection galeri={home.galeri} />
      <CTASection />
    </>
  )
}
