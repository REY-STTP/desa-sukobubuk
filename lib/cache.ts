import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
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
  // F2-Fase3 / T-32 — tag invalidasi list audit-log (ditulis tiap
  // `logAdminAction`, lihat `lib/audit.ts`).
  auditLog: 'audit-log',
} as const

export const PAGE_SIZE = 15
export const PUBLIC_PAGE_SIZE = 9

// ─── Timing observabilitas (dev-only) ───────────────────────
// F2-Fase5 / T-50: `timed(label, promise)` mengukur ms tiap query list
// admin. Aktif hanya bila `DEBUG_PRISMA=1` (default: teruskan promise
// tanpa log). Memakai `console.warn` AGAR TAMPIL di terminal dev —
// `console.log/info` server diteruskan Next ke browser console saja
// (terbukti via probe 2026-09-11). Di production, `warn` dikecualikan
// dari `removeConsole` (T-42) sehingga flag tetap berguna bila disetel.
// CATATAN DESAIN (2026-09-11): `$extends $allOperations` dievaluasi dulu
// dan DITOLAK — hook-nya terbukti tak pernah dieksekusi di runtime
// Turbopack dev (probe tanpa syarat pun senyap), walau file yang sama
// jalan sempurna di plain node. Call-site wrapper ini terverifikasi jalan.
// Janji Prisma lazy (eksekusi mulai saat `await`), sehingga mengukur
// promise yang diteruskan tetap akurat.
const DEBUG_TIMING = process.env.DEBUG_PRISMA === '1'

function timed<T>(label: string, promise: Promise<T>): Promise<T> {
  if (!DEBUG_TIMING) return promise
  const t0 = Date.now()
  return promise.then(
    (v) => {
      // Sengaja warn (bukan info): dev server Next meneruskan
      // console.log/info server ke browser console saja — warn yang
      // tampil di terminal. Berprefix jelas + hanya bila flag aktif.
      console.warn(`[db-timing] ${label}: ${Date.now() - t0}ms`)
      return v
    },
    (e) => {
      console.warn(`[db-timing] ${label}: GAGAL ${Date.now() - t0}ms`)
      throw e
    }
  )
}

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
      const [data, total] = await timed('getProdukPage', prisma.$transaction([
        prisma.produk.findMany({
          where,
          take: PAGE_SIZE,
          skip,
          orderBy: { created_at: 'desc' },
          include: { umkm: { select: { nama_usaha: true, kategori: true } } },
        }),
        prisma.produk.count({ where }),
      ]))
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
      const [data, total] = await timed('getBeritaPage', prisma.$transaction([
        prisma.berita.findMany({
          where,
          take: PAGE_SIZE,
          skip,
          orderBy: { created_at: 'desc' },
          include: { author: { select: { name: true } } },
        }),
        prisma.berita.count({ where }),
      ]))
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
      const [data, total] = await timed('getUMKMPage', prisma.$transaction([
        prisma.uMKM.findMany({
          where,
          take: PAGE_SIZE,
          skip,
          orderBy: { created_at: 'desc' },
          include: { _count: { select: { produk: true } } },
        }),
        prisma.uMKM.count({ where }),
      ]))
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
      const [data, total] = await timed('getGaleriPage', prisma.$transaction([
        prisma.galeri.findMany({
          where,
          take: PAGE_SIZE,
          skip,
          orderBy: { created_at: 'desc' },
        }),
        prisma.galeri.count({ where }),
      ]))
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
      const [data, total, belumDibaca] = await timed('getPesanPage', prisma.$transaction([
        prisma.pesan.findMany({
          where,
          take: PAGE_SIZE,
          skip,
          orderBy: { created_at: 'desc' },
        }),
        prisma.pesan.count({ where }),
        prisma.pesan.count({ where: { is_read: false } }),
      ]))
      return { data, total, belumDibaca, totalPages: Math.ceil(total / PAGE_SIZE) }
    },
    ['pesan-page', String(page), search],
    // Pesan is admin-facing and updates frequently when warga contact the
    // village; keep at 10s for near-real-time feel.
    { revalidate: 10, tags: [CACHE_TAGS.pesan] }
  )()
}

// ─── Admin Shell (badge + nama desa) ────────────────────────
// F2 (T-20): dipindah keluar dari `await` langsung di layout agar shell
// + children bisa streaming via `<Suspense>` di
// `app/(admin)/(dashboard)/layout.tsx`. `nama_desa` reuse `getProfilDesa`
// (3600s, tag `profil`) — tidak ada cache baru untuknya.
export const getPesanBelumDibaca = unstable_cache(
  async (): Promise<number> => {
    try {
      return timed('getPesanBelumDibaca', prisma.pesan.count({ where: { is_read: false } }))
    } catch {
      // DB unreachable — badge saja yang 0; halaman punya empty-state
      // sendiri. Jangan lempar (layout tidak boleh crash karena badge).
      return 0
    }
  },
  ['pesan-belum-dibaca'],
  // TTL 15s + tag `pesan`: PATCH/DELETE pesan (admin) menginvalidasi
  // segera via `revalidateTag('pesan')`; pesan baru dari form kontak
  // publik (tanpa revalidateTag) terlihat ≤15s. Tanpa cache ini setiap
  // navigasi sidebar = 1 `count` ke pooler.
  { revalidate: 15, tags: [CACHE_TAGS.pesan] }
)

// ─── Audit Log (Admin) ────────────────────────────────────
// F2-Fase3 / T-32: where-builder dipakai bersama halaman
// `admin/audit-log/page.tsx` dan `GET /api/admin/audit-log` agar logika
// filter/search tak lagi duplikat dan drift.
export const AUDIT_LOG_TAKE = 20
export const AUDIT_LOG_MAX_QUERY_LEN = 100
export const AUDIT_LOG_MAX_PAGE = 500
export const AUDIT_LOG_PAYLOAD_PREVIEW_LEN = 300

export function buildAuditLogWhere(search = '', entity?: string, action?: string): Prisma.AuditLogWhereInput {
  const q = search.trim().slice(0, AUDIT_LOG_MAX_QUERY_LEN)
  const where: Prisma.AuditLogWhereInput = {}
  if (entity) where.entity = entity
  if (action) where.action = action
  if (q) {
    where.OR = [
      { entityId: { contains: q, mode: 'insensitive' } },
      { userEmail: { contains: q, mode: 'insensitive' } },
      { action: { contains: q, mode: 'insensitive' } },
      { entity: { contains: q, mode: 'insensitive' } },
    ]
  }
  return where
}

export function toAuditPayloadPreview(payload: unknown): { preview: string | null; truncated: boolean } {
  if (payload == null) return { preview: null, truncated: false }
  let s: string
  try {
    s = JSON.stringify(payload)
  } catch {
    return { preview: null, truncated: false }
  }
  if (s.length <= AUDIT_LOG_PAYLOAD_PREVIEW_LEN) return { preview: s, truncated: false }
  return { preview: s.slice(0, AUDIT_LOG_PAYLOAD_PREVIEW_LEN), truncated: true }
}

export const getAuditLogPage = (rawPage: number, search = '', entity?: string, action?: string) => {
  const page = Math.min(AUDIT_LOG_MAX_PAGE, clampPage(rawPage))
  const q = search.trim().slice(0, AUDIT_LOG_MAX_QUERY_LEN)
  const entityFilter = entity?.trim() || undefined
  const actionFilter = action?.trim() || undefined
  return unstable_cache(
    async () => {
      const skip = (page - 1) * AUDIT_LOG_TAKE
      const where = buildAuditLogWhere(q, entityFilter, actionFilter)
      const [rows, total] = await timed('getAuditLogPage', prisma.$transaction([
        prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: AUDIT_LOG_TAKE,
          // F2: payload penuh TIDAK ikut ke HTML — hanya cuplikan
          // (diukur live: max 147 B, avg 44 B; write-side cap 10 KB).
          select: {
            id: true,
            userId: true,
            userEmail: true,
            action: true,
            entity: true,
            entityId: true,
            payload: true,
            ip: true,
            createdAt: true,
          },
        }),
        prisma.auditLog.count({ where }),
      ]))
      const data = rows.map((row) => {
        const { payload, ...rest } = row
        const { preview, truncated } = toAuditPayloadPreview(payload)
        return { ...rest, payloadPreview: preview, payloadTruncated: truncated }
      })
      return { data, total, totalPages: Math.max(1, Math.ceil(total / AUDIT_LOG_TAKE)) }
    },
    ['audit-log-page', String(page), q, entityFilter ?? '', actionFilter ?? ''],
    { revalidate: 60, tags: [CACHE_TAGS.auditLog] }
  )()
}

// ─── Dashboard Stats ──────────────────────────────────────
// F1 (T-12): `pesanTerbaru` hanya membawa kolom yang dirender kartu
// (nama + cuplikan isi, bukan `isi_pesan` penuh) via `select` eksplisit.
// `pesanBelumDibaca` di sini untuk KARTU dashboard; badge sidebar tetap
// dihitung layout (`layout.tsx`) — keduanya membaca sumber yang sama
// tapi tidak saling bergantung (lihat T-20 untuk penyatuan).
// Panjang cuplikan disamakan dengan pemakaian di API stats.
export const STATS_PESAN_SNIPPET_LEN = 140

export function toPesanSnippet<T extends { isi_pesan: string }>(p: T): T {
  if (p.isi_pesan.length <= STATS_PESAN_SNIPPET_LEN) return p
  return { ...p, isi_pesan: p.isi_pesan.slice(0, STATS_PESAN_SNIPPET_LEN) + '…' }
}

export const getDashboardStats = unstable_cache(
  async () => {
    const [totalUMKM, totalProduk, totalBerita, totalGaleri, totalPesan, pesanBelumDibaca, pesanTerbaruRows] =
      await timed('getDashboardStats', Promise.all([
        prisma.uMKM.count(),
        prisma.produk.count(),
        prisma.berita.count(),
        prisma.galeri.count(),
        prisma.pesan.count(),
        prisma.pesan.count({ where: { is_read: false } }),
        prisma.pesan.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          select: { id: true, nama: true, email: true, isi_pesan: true, is_read: true, created_at: true },
        }),
      ]))
    // F1: potong di server agar `isi_pesan` penuh tidak transit di
    // payload RSC/JSON. F0-4: tabel masih <20 baris sehingga
    // `Promise.all` paralel dipertahankan — `$transaction` tidak dipakai
    // (butuh ukur dulu di pooler; batching menahan 1 koneksi + overhead
    // BEGIN/COMMIT PgBouncer tanpa bukti lebih cepat).
    const pesanTerbaru = pesanTerbaruRows.map(toPesanSnippet)
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
        await timed('getHomeData', withDbRetry(() =>
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