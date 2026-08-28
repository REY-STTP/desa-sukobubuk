import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desa-sukobubuk.id').replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/profil/sejarah`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/profil/visi-misi`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/profil/struktur-organisasi`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/berita`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/umkm`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/kontak`, changeFrequency: 'yearly', priority: 0.6 },
  ]

  let beritaEntries: MetadataRoute.Sitemap = []
  let umkmEntries: MetadataRoute.Sitemap = []

  try {
    const [berita, umkm] = await Promise.all([
      prisma.berita.findMany({
        select: { slug: true, created_at: true },
        orderBy: { created_at: 'desc' },
      }),
      prisma.uMKM.findMany({
        select: { slug: true, created_at: true },
        orderBy: { created_at: 'desc' },
      }),
    ])

    beritaEntries = berita.map((b) => ({
      url: `${SITE_URL}/berita/${b.slug}`,
      lastModified: b.created_at,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))

    umkmEntries = umkm.map((u) => ({
      url: `${SITE_URL}/umkm/${u.slug}`,
      lastModified: u.created_at,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    // DB unreachable — kembalikan base routes saja
  }

  return [...baseRoutes, ...beritaEntries, ...umkmEntries]
}
