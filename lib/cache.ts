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
export const PUBLIC_PAGE_SIZE = 9

// ─── Produk (Admin) ───────────────────────────────────────
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

// ─── Berita (Admin) ───────────────────────────────────────
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

// ─── UMKM (Admin) ─────────────────────────────────────────
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

// ─── Galeri (Admin) ───────────────────────────────────────
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

// ─── Pesan (Admin) ────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════
// PUBLIC CACHING FUNCTIONS
// ════════════════════════════════════════════════════════════

// ─── Home Page ────────────────────────────────────────────
export const getHomeData = unstable_cache(
  async () => {
    const [umkmFeatured, beritaTerbaru, galeri] = await Promise.all([
      prisma.uMKM.findMany({
        where: { is_featured: true },
        take: 3,
        orderBy: { created_at: 'desc' },
      }),
      prisma.berita.findMany({
        take: 3,
        orderBy: { created_at: 'desc' },
        include: { author: { select: { name: true } } },
      }),
      prisma.galeri.findMany({ take: 6, orderBy: { created_at: 'desc' } }),
    ])
    return { umkmFeatured, beritaTerbaru, galeri }
  },
  ['home-data'],
  { revalidate: 60, tags: [CACHE_TAGS.umkm, CACHE_TAGS.berita, CACHE_TAGS.galeri] }
)

// ─── Public Layout (Profil Desa) ──────────────────────────
export const getProfilDesa = unstable_cache(
  async () => {
    return prisma.profilDesa.findFirst({
      select: {
        nama_desa: true,
        nama_kecamatan: true,
        nama_kabupaten: true,
      },
    })
  },
  ['profil-desa'],
  { revalidate: 3600, tags: [CACHE_TAGS.profil] }
)

// ─── Berita Public (dengan pagination) ───────────────────
export const getBeritaPublik = (page: number) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * PUBLIC_PAGE_SIZE
      const [data, total] = await prisma.$transaction([
        prisma.berita.findMany({
          skip,
          take: PUBLIC_PAGE_SIZE,
          orderBy: { created_at: 'desc' },
          include: { author: { select: { name: true } } },
        }),
        prisma.berita.count(),
      ])
      return { data, total, totalPages: Math.ceil(total / PUBLIC_PAGE_SIZE) }
    },
    ['berita-publik', String(page)],
    { revalidate: 60, tags: [CACHE_TAGS.berita] }
  )()

// ─── Berita Detail ────────────────────────────────────────
export const getBeritaDetail = (slug: string) =>
  unstable_cache(
    async () => {
      const [berita, lainnya] = await Promise.all([
        prisma.berita.findUnique({
          where: { slug },
          include: { author: { select: { name: true } } },
        }),
        prisma.berita.findMany({
          where: { slug: { not: slug } },
          take: 3,
          orderBy: { created_at: 'desc' },
          include: { author: { select: { name: true } } },
        }),
      ])
      return { berita, lainnya }
    },
    ['berita-detail', slug],
    { revalidate: 60, tags: [CACHE_TAGS.berita] }
  )()

// ─── UMKM Public (dengan pagination) ─────────────────────
export const getUMKMPublik = (page: number) =>
  unstable_cache(
    async () => {
      const skip = (page - 1) * PUBLIC_PAGE_SIZE
      const [data, total, kategoriList] = await Promise.all([
        prisma.uMKM.findMany({
          skip,
          take: PUBLIC_PAGE_SIZE,
          orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
          include: { _count: { select: { produk: true } } },
        }),
        prisma.uMKM.count(),
        prisma.uMKM.findMany({
          select: { kategori: true },
          distinct: ['kategori'],
          orderBy: { kategori: 'asc' },
        }),
      ])
      return {
        data,
        total,
        totalPages: Math.ceil(total / PUBLIC_PAGE_SIZE),
        kategoriList: kategoriList.map((u) => u.kategori),
      }
    },
    ['umkm-publik', String(page)],
    { revalidate: 60, tags: [CACHE_TAGS.umkm] }
  )()

// ─── UMKM Detail ─────────────────────────────────────────
export const getUMKMDetail = (slug: string) =>
  unstable_cache(
    async () => {
      return prisma.uMKM.findUnique({
        where: { slug },
        include: {
          produk: {
            where: { is_available: true },
            orderBy: { created_at: 'asc' },
          },
        },
      })
    },
    ['umkm-detail', slug],
    { revalidate: 60, tags: [CACHE_TAGS.umkm, CACHE_TAGS.produk] }
  )()

// ─── Produk Detail ────────────────────────────────────────
export const getProdukDetail = (produkSlug: string) =>
  unstable_cache(
    async () => {
      return prisma.produk.findUnique({
        where: { slug: produkSlug },
        include: { umkm: true },
      })
    },
    ['produk-detail', produkSlug],
    { revalidate: 60, tags: [CACHE_TAGS.produk] }
  )()

export const getProdukLain = (umkmId: number, excludeSlug: string) =>
  unstable_cache(
    async () => {
      return prisma.produk.findMany({
        where: { umkm_id: umkmId, slug: { not: excludeSlug }, is_available: true },
        take: 3,
      })
    },
    ['produk-lain', String(umkmId), excludeSlug],
    { revalidate: 60, tags: [CACHE_TAGS.produk] }
  )()