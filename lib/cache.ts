import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { withDbRetry } from '@/lib/db-retry'
import { clampPage } from '@/lib/utils'

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
export const getProdukPage = (rawPage: number, search = '') => {
  // P1-B2: normalisasi agar skip tak pernah negatif/NaN (juga kunci cache).
  const page = clampPage(rawPage)
  return unstable_cache(
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
          include: { umkm: { select: { nama_usaha: true, kategori: true } } },
        }),
        prisma.produk.count({ where }),
      ])
      return { data, total, totalPages: Math.ceil(total / PAGE_SIZE) }
    },
    ['produk-page', String(page), search],
    // F-219: PERF-002 — bumped from 30s. Admin lists are invalidation-driven
    // (revalidateTag on every mutation), so the underlying revalidate is
    // just a safety net.
    { revalidate: 300, tags: [CACHE_TAGS.produk] }
  )()
}

// ─── Berita (Admin) ───────────────────────────────────────
export const getBeritaPage = (rawPage: number, search = '') => {
  // P1-B2: normalisasi agar skip tak pernah negatif/NaN (juga kunci cache).
  const page = clampPage(rawPage)
  return unstable_cache(
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
    { revalidate: 300, tags: [CACHE_TAGS.berita] }
  )()
}

// ─── UMKM (Admin) ─────────────────────────────────────────
export const getUMKMPage = (rawPage: number, search = '') => {
  // P1-B2: normalisasi agar skip tak pernah negatif/NaN (juga kunci cache).
  const page = clampPage(rawPage)
  return unstable_cache(
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
    { revalidate: 300, tags: [CACHE_TAGS.umkm] }
  )()
}

// ─── Galeri (Admin) ───────────────────────────────────────
export const getGaleriPage = (rawPage: number, search = '') => {
  // P1-B2: normalisasi agar skip tak pernah negatif/NaN (juga kunci cache).
  const page = clampPage(rawPage)
  return unstable_cache(
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
    { revalidate: 300, tags: [CACHE_TAGS.galeri] }
  )()
}

// ─── Pesan (Admin) ────────────────────────────────────────
export const getPesanPage = (rawPage: number, search = '') => {
  // P1-B2: normalisasi agar skip tak pernah negatif/NaN (juga kunci cache).
  const page = clampPage(rawPage)
  return unstable_cache(
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
    // Pesan is admin-facing and updates frequently when warga contact the
    // village; keep at 10s for near-real-time feel.
    { revalidate: 10, tags: [CACHE_TAGS.pesan] }
  )()
}

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
  { revalidate: 300, tags: [CACHE_TAGS.dashboard] }
)

// ════════════════════════════════════════════════════════════
// PUBLIC CACHING FUNCTIONS
// ════════════════════════════════════════════════════════════

// ─── Home Page ────────────────────────────────────────────
export const getHomeData = unstable_cache(
  async () => {
    try {
      const [umkmFeatured, beritaTerbaru, galeri, umkmCount, produkCount, profilSnippet] =
        await withDbRetry(() =>
          Promise.all([
            prisma.uMKM.findMany({
              where: { is_featured: true },
              take: 5,
              orderBy: { created_at: 'desc' },
            }),
            prisma.berita.findMany({
              take: 5,
              orderBy: { created_at: 'desc' },
              include: { author: { select: { name: true } } },
            }),
            prisma.galeri.findMany({ take: 6, orderBy: { created_at: 'desc' } }),
            // F-218 / audit §13.6: PERF-006 — fold the additional home-page
            // queries (UMKM count, produk count, profil snippet) into the
            // home-data fetch so the page can render in a single round-trip.
            prisma.uMKM.count(),
            prisma.produk.count(),
            // P1-C2: diperluas untuk HeroSection agar tak query ulang
            // (nama wilayah + kode pos dibaca dari baris yang sama).
            prisma.profilDesa.findFirst({
              select: {
                nama_desa: true,
                nama_kecamatan: true,
                nama_kabupaten: true,
                nama_provinsi: true,
                kode_pos: true,
                jumlah_penduduk: true,
                tahun_berdiri: true,
              },
            }),
          ])
        )
      return {
        umkmFeatured,
        beritaTerbaru,
        galeri,
        umkmCount,
        produkCount,
        profilSnippet,
      }
    } catch {
      // DB unreachable — graceful degradation, jangan crash page
      return {
        umkmFeatured: [],
        beritaTerbaru: [],
        galeri: [],
        umkmCount: 0,
        produkCount: 0,
        profilSnippet: null,
      }
    }
  },
  ['home-data'],
  // PERF-002: bumped from 60s. Home content is invalidated via
  // revalidateTag on setiap mutation. Tags now include produk + profil
  // so umkmCount/produkCount/profilSnippet invalidate correctly.
  {
    revalidate: 300,
    tags: [CACHE_TAGS.umkm, CACHE_TAGS.berita, CACHE_TAGS.galeri, CACHE_TAGS.produk, CACHE_TAGS.profil],
  }
)

// ─── Public Layout (Profil Desa) ──────────────────────────
export const getProfilDesa = unstable_cache(
  async () => {
    try {
      return prisma.profilDesa.findFirst({
        select: {
          nama_desa: true,
          nama_kecamatan: true,
          nama_kabupaten: true,
        },
      })
    } catch {
      // DB unreachable — caller punya default fallback di layout
      return null
    }
  },
  ['profil-desa'],
  { revalidate: 3600, tags: [CACHE_TAGS.profil] }
)

// ─── Profil Lengkap (dibagi banyak komponen publik) ──────
// P1-C2: satu baris profil dibaca di Navbar, Footer, CTA, kontak,
// profil, not-found, login. Tanpa cache bersama, tiap render = 1 query
// pooler. Revalidasi via tag `profil` (lihat PUT profil route).
export const getProfilLengkap = unstable_cache(
  async () => {
    try {
      return await prisma.profilDesa.findFirst()
    } catch {
      // DB unreachable — caller punya fallback default
      return null
    }
  },
  ['profil-lengkap'],
  { revalidate: 3600, tags: [CACHE_TAGS.profil] }
)

// ─── Berita Public (dengan pagination) ───────────────────
export const getBeritaPublik = (page: number) =>
  unstable_cache(
    async () => {
      try {
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
      } catch {
        // DB unreachable — return empty page agar caller render empty state
        return { data: [], total: 0, totalPages: 0 }
      }
    },
    ['berita-publik', String(page)],
    { revalidate: 300, tags: [CACHE_TAGS.berita] }
  )()

// ─── Berita Detail ────────────────────────────────────────
export const getBeritaDetail = (slug: string) =>
  unstable_cache(
    async () => {
      try {
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
      } catch {
        // DB unreachable (mis. Vercel → Supabase pooler timeout saat background revalidate).
        // Return null agar caller (generateMetadata & page) bisa fallback ke notFound() / empty state
        // alih-alih meledak jadi 500.
        return { berita: null, lainnya: [] as never[] }
      }
    },
    ['berita-detail', slug],
    { revalidate: 300, tags: [CACHE_TAGS.berita] }
  )()

// ─── UMKM Public (dengan pagination) ─────────────────────
// P2-F1: daftar kategori statis — cache sendiri (1 jam) agar tak diquery
// `distinct` setiap ganti halaman.
export const getUMKMKategori = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const rows = await prisma.uMKM.findMany({
        select: { kategori: true },
        distinct: ['kategori'],
        orderBy: { kategori: 'asc' },
      })
      return rows.map((u) => u.kategori)
    } catch {
      return []
    }
  },
  ['umkm-kategori'],
  { revalidate: 3600, tags: [CACHE_TAGS.umkm] }
)

export const getUMKMPublik = (page: number) =>
  unstable_cache(
    async () => {
      try {
        const skip = (page - 1) * PUBLIC_PAGE_SIZE
        const [data, total, kategoriList] = await Promise.all([
          prisma.uMKM.findMany({
            skip,
            take: PUBLIC_PAGE_SIZE,
            orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
            include: { _count: { select: { produk: true } } },
          }),
          prisma.uMKM.count(),
          getUMKMKategori(),
        ])
        return {
          data,
          total,
          totalPages: Math.ceil(total / PUBLIC_PAGE_SIZE),
          kategoriList,
        }
      } catch {
        // DB unreachable — return empty page
        return { data: [], total: 0, totalPages: 0, kategoriList: [] }
      }
    },
    ['umkm-publik', String(page)],
    { revalidate: 300, tags: [CACHE_TAGS.umkm] }
  )()

// ─── UMKM Detail ─────────────────────────────────────────
export const getUMKMDetail = (slug: string) =>
  unstable_cache(
    async () => {
      try {
        return prisma.uMKM.findUnique({
          where: { slug },
          include: {
            produk: {
              where: { is_available: true },
              orderBy: { created_at: 'asc' },
            },
          },
        })
      } catch {
        // DB unreachable — caller akan notFound() di halaman detail
        return null
      }
    },
    ['umkm-detail', slug],
    { revalidate: 300, tags: [CACHE_TAGS.umkm, CACHE_TAGS.produk] }
  )()

// ─── Produk Detail ────────────────────────────────────────
export const getProdukDetail = (produkSlug: string) =>
  unstable_cache(
    async () => {
      try {
        return prisma.produk.findUnique({
          where: { slug: produkSlug },
          include: { umkm: true },
        })
      } catch {
        // DB unreachable — caller akan notFound() di halaman detail
        return null
      }
    },
    ['produk-detail', produkSlug],
    // P2-F1: tambah tag umkm — guard halaman memakai umkm.slug sehingga
    // rename slug UMKM harus menginvalidasi cache produk.
    { revalidate: 300, tags: [CACHE_TAGS.produk, CACHE_TAGS.umkm] }
  )()

export const getProdukLain = (umkmId: number, excludeSlug: string) =>
  unstable_cache(
    async () => {
      try {
        return prisma.produk.findMany({
          where: { umkm_id: umkmId, slug: { not: excludeSlug }, is_available: true },
          take: 3,
        })
      } catch {
        // DB unreachable — return empty array agar caller tidak crash
        return [] as Awaited<ReturnType<typeof prisma.produk.findMany>>
      }
    },
    ['produk-lain', String(umkmId), excludeSlug],
    { revalidate: 300, tags: [CACHE_TAGS.produk] }
  )()