import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const CACHE_TAGS = {
  produk: 'produk',
  berita: 'berita',
  umkm: 'umkm',
  galeri: 'galeri',
  pesan: 'pesan',
  profil: 'profil',
  dashboard: 'dashboard',
} as const

export const PAGE_SIZE = 15

// ─── Produk ───────────────────────────────────────────────
export const getProdukPage = unstable_cache(
  async (page: number) => {
    const skip = (page - 1) * PAGE_SIZE
    const [data, total] = await prisma.$transaction([
      prisma.produk.findMany({
        take: PAGE_SIZE,
        skip,
        orderBy: { created_at: 'desc' },
        include: { umkm: { select: { nama_usaha: true } } },
      }),
      prisma.produk.count(),
    ])
    return { data, total, totalPages: Math.ceil(total / PAGE_SIZE) }
  },
  ['produk-page'],
  { revalidate: 30, tags: [CACHE_TAGS.produk] }
)

// ─── Berita ───────────────────────────────────────────────
export const getBeritaPage = unstable_cache(
  async (page: number) => {
    const skip = (page - 1) * PAGE_SIZE
    const [data, total] = await prisma.$transaction([
      prisma.berita.findMany({
        take: PAGE_SIZE,
        skip,
        orderBy: { created_at: 'desc' },
        include: { author: { select: { name: true } } },
      }),
      prisma.berita.count(),
    ])
    return { data, total, totalPages: Math.ceil(total / PAGE_SIZE) }
  },
  ['berita-page'],
  { revalidate: 30, tags: [CACHE_TAGS.berita] }
)

// ─── UMKM ─────────────────────────────────────────────────
export const getUMKMPage = unstable_cache(
  async (page: number) => {
    const skip = (page - 1) * PAGE_SIZE
    const [data, total] = await prisma.$transaction([
      prisma.uMKM.findMany({
        take: PAGE_SIZE,
        skip,
        orderBy: { created_at: 'desc' },
        include: { _count: { select: { produk: true } } },
      }),
      prisma.uMKM.count(),
    ])
    return { data, total, totalPages: Math.ceil(total / PAGE_SIZE) }
  },
  ['umkm-page'],
  { revalidate: 30, tags: [CACHE_TAGS.umkm] }
)

// ─── Galeri ───────────────────────────────────────────────
export const getGaleriPage = unstable_cache(
  async (page: number) => {
    const skip = (page - 1) * PAGE_SIZE
    const [data, total] = await prisma.$transaction([
      prisma.galeri.findMany({
        take: PAGE_SIZE,
        skip,
        orderBy: { created_at: 'desc' },
      }),
      prisma.galeri.count(),
    ])
    return { data, total, totalPages: Math.ceil(total / PAGE_SIZE) }
  },
  ['galeri-page'],
  { revalidate: 30, tags: [CACHE_TAGS.galeri] }
)

// ─── Pesan ────────────────────────────────────────────────
export const getPesanPage = unstable_cache(
  async (page: number) => {
    const skip = (page - 1) * PAGE_SIZE
    const [data, total, belumDibaca] = await prisma.$transaction([
      prisma.pesan.findMany({
        take: PAGE_SIZE,
        skip,
        orderBy: { created_at: 'desc' },
      }),
      prisma.pesan.count(),
      prisma.pesan.count({ where: { is_read: false } }),
    ])
    return { data, total, belumDibaca, totalPages: Math.ceil(total / PAGE_SIZE) }
  },
  ['pesan-page'],
  { revalidate: 10, tags: [CACHE_TAGS.pesan] }
)

// ─── Dashboard Stats ──────────────────────────────────────
export const getDashboardStats = unstable_cache(
  async () => {
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
    return { totalUMKM, totalProduk, totalBerita, totalGaleri, totalPesan, pesanBelumDibaca, pesanTerbaru }
  },
  ['dashboard-stats'],
  { revalidate: 30, tags: [CACHE_TAGS.dashboard] }
)
