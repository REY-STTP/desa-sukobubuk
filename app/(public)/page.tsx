import type { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import FeaturedUMKM from '@/components/sections/FeaturedUMKM'
import LatestBerita from '@/components/sections/LatestBerita'
import GaleriSection from '@/components/sections/GaleriSection'
import CTASection from '@/components/sections/CTASection'
import { getHomeData } from '@/lib/cache'

export const metadata: Metadata = {
  title: 'Beranda',
}

export default async function HomePage() {
  const { umkmFeatured, beritaTerbaru, galeri } = await getHomeData()

  return (
    <>
      <HeroSection />
      <FeaturedUMKM umkm={umkmFeatured} />
      <LatestBerita berita={beritaTerbaru} />
      <GaleriSection galeri={galeri} />
      <CTASection />
    </>
  )
}