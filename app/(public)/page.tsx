import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/sections/HeroSection'
import FeaturedUMKM from '@/components/sections/FeaturedUMKM'
import LatestBerita from '@/components/sections/LatestBerita'
import GaleriSection from '@/components/sections/GaleriSection'
import CTASection from '@/components/sections/CTASection'

async function getHomeData() {
  const [umkmFeatured, beritaTerbaru, galeri, totalUMKM, totalProduk] = await Promise.all([
    prisma.uMKM.findMany({ where: { is_featured: true }, take: 3, orderBy: { created_at: 'desc' } }),
    prisma.berita.findMany({ take: 3, orderBy: { created_at: 'desc' }, include: { author: { select: { name: true } } } }),
    prisma.galeri.findMany({ take: 6, orderBy: { created_at: 'desc' } }),
    prisma.uMKM.count(),
    prisma.produk.count(),
  ])
  return { umkmFeatured, beritaTerbaru, galeri, totalUMKM, totalProduk }
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
