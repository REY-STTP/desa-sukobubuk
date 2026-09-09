import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import FeaturedUMKM from '@/components/sections/FeaturedUMKM'
import LatestBerita from '@/components/sections/LatestBerita'
import CTASection from '@/components/sections/CTASection'
import StatsSection from '@/components/sections/StatsSection'
import { getHomeData } from '@/lib/cache'
import GaleriSectionLazy from './_lazy-galeri'

export const metadata: Metadata = {
  title: 'Beranda',
}

// P1-C2: ISR 5 menit (ganti force-dynamic). Data via getHomeData yang
// sudah revalidate:300 + revalidateTag per mutasi — TTFB jauh lebih baik
// dan konten tetap segar. DB down saat build: getHomeData mengembalikan
// default kosong (soft failure), build tetap sukses.
export const revalidate = 300

export default async function HomePage() {
  // PERF-006: one round-trip via `getHomeData()` (cached). The cache key
  // includes all relevant filters, and the function now also returns the
  // UMKM count, produk count, and profil snippet that the Stats section
  // needs. If the DB is unreachable, the cached function returns the
  // empty defaults; we treat that as a soft failure and render zeros.
  const home = await getHomeData()
  const profil = home.profilSnippet
  const totalUMKM = home.umkmCount ?? 0
  const totalProduk = home.produkCount ?? 0

  return (
    <>
      <HeroSection
        namaDesa={profil?.nama_desa ?? 'Desa Sukobubuk'}
        namaKecamatan={profil?.nama_kecamatan ?? 'Kecamatan Margorejo'}
        namaKabupaten={profil?.nama_kabupaten ?? 'Kabupaten Pati'}
        namaProvinsi={profil?.nama_provinsi ?? 'Jawa Tengah'}
        kodePos={profil?.kode_pos ?? '59163'}
        jumlahPenduduk={profil?.jumlah_penduduk ?? 0}
        tahunBerdiri={profil?.tahun_berdiri?.toString() ?? ''}
        totalUMKM={totalUMKM}
        totalProduk={totalProduk}
      />
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
      {/* F-310 / PERF-005 — GaleriSection is the heaviest client component
          on this page (framer-motion + lightbox). Lazy-loading it via a
          client wrapper means the chunk loads after the rest of the page
          is interactive. */}
      <GaleriSectionLazy galeri={home.galeri} />
      <CTASection />
    </>
  )
}
