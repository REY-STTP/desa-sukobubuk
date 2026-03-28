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
export const getProdukPage = (page: number, search = '') =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * PAGE_SIZE
      const where = search
        ? {
            OR: [
              { nama_produk: { contains: search, mode: 'insensitive' as const } },
              { slug: { contains: search, mode: 'insensitive' as const } },
              { umkm: { nama_usaha: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}
      const [data, total] = await prisma.$transaction([
        prisma.produk.findMany({
          where,
          take: PAGE_SIZE,
          skip,
          orderBy: { created_at: 'desc' },
          include: { umkm: { select: { nama_usaha: true } } },
        }),
        prisma.produk.count({ where }),
      ])
      return { data, total, totalPages: Math.ceil(total / PAGE_SIZE) }
    },
    ['produk-page', String(page), search],
    { revalidate: 30, tags: [CACHE_TAGS.produk] }
  )()

// ─── Berita ───────────────────────────────────────────────
export const getBeritaPage = (page: number, search = '') =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * PAGE_SIZE
      const where = search
        ? {
            OR: [
              { judul: { contains: search, mode: 'insensitive' as const } },
              { slug: { contains: search, mode: 'insensitive' as const } },
              { author: { name: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}
      const [data, total] = await prisma.$transaction([
        prisma.berita.findMany({
          where,
          take: PAGE_SIZE,
          skip,
          orderBy: { created_at: 'desc' },
          include: { author: { select: { name: true } } },
        }),
        prisma.berita.count({ where }),
      ])
      return { data, total, totalPages: Math.ceil(total / PAGE_SIZE) }
    },
    ['berita-page', String(page), search],
    { revalidate: 30, tags: [CACHE_TAGS.berita] }
  )()

// ─── UMKM ─────────────────────────────────────────────────
export const getUMKMPage = (page: number, search = '') =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * PAGE_SIZE
      const where = search
        ? {
            OR: [
              { nama_usaha: { contains: search, mode: 'insensitive' as const } },
              { pemilik: { contains: search, mode: 'insensitive' as const } },
              { kategori: { contains: search, mode: 'insensitive' as const } },
              { alamat: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}
      const [data, total] = await prisma.$transaction([
        prisma.uMKM.findMany({
          where,
          take: PAGE_SIZE,
          skip,
          orderBy: { created_at: 'desc' },
          include: { _count: { select: { produk: true } } },
        }),
        prisma.uMKM.count({ where }),
      ])
      return { data, total, totalPages: Math.ceil(total / PAGE_SIZE) }
    },
    ['umkm-page', String(page), search],
    { revalidate: 30, tags: [CACHE_TAGS.umkm] }
  )()

// ─── Galeri ───────────────────────────────────────────────
export const getGaleriPage = (page: number, search = '') =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * PAGE_SIZE
      const where = search
        ? { judul: { contains: search, mode: 'insensitive' as const } }
        : {}
      const [data, total] = await prisma.$transaction([
        prisma.galeri.findMany({
          where,
          take: PAGE_SIZE,
          skip,
          orderBy: { created_at: 'desc' },
        }),
        prisma.galeri.count({ where }),
      ])
      return { data, total, totalPages: Math.ceil(total / PAGE_SIZE) }
    },
    ['galeri-page', String(page), search],
    { revalidate: 30, tags: [CACHE_TAGS.galeri] }
  )()

// ─── Pesan ────────────────────────────────────────────────
export const getPesanPage = (page: number, search = '') =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * PAGE_SIZE
      const where = search
        ? {
            OR: [
              { nama: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              { isi_pesan: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}
      const [data, total, belumDibaca] = await prisma.$transaction([
        prisma.pesan.findMany({
          where,
          take: PAGE_SIZE,
          skip,
          orderBy: { created_at: 'desc' },
        }),
        prisma.pesan.count({ where }),
        prisma.pesan.count({ where: { is_read: false } }),
      ])
      return { data, total, belumDibaca, totalPages: Math.ceil(total / PAGE_SIZE) }
    },
    ['pesan-page', String(page), search],
    { revalidate: 10, tags: [CACHE_TAGS.pesan] }
  )()

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