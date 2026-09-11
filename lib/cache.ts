import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { withDbRetry } from '@/lib/db-retry'
import { clampPage, truncate, stripHtml } from '@/lib/utils'

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

// ─── Snippet teks kaya untuk list publik ────────────────────
// F2-FaseP2 / T-P21: kartu list hanya render 110–200 char (berita) atau
// line-clamp CSS (UMKM), sehingga `konten`/`deskripsi` penuh tak perlu
// transit DB → server → RSC. Idempoten terhadap `truncate(stripHtml())`
// yang sudah dilakukan UI (panjang cuplikan ≥ pemakaian UI).
export const BERITA_SNIPPET_LEN = 250
export const UMKM_DESKRIPSI_SNIPPET_LEN = 300

export function toKontenSnippet(html: string, len = BERITA_SNIPPET_LEN): string {
  return truncate(stripHtml(html), len)
}

export const PUBLIC_MAX_PAGE = 500

// ─── Home Page ────────────────────────────────────────────
export const getHomeData = unstable_cache(
  async () => {
    try {
      const [umkmFeaturedRows, beritaTerbaruRows, galeri, umkmCount, produkCount, profilSnippet] =
        await timed('getHomeData', withDbRetry(() =>
          Promise.all([
            prisma.uMKM.findMany({
              where: { is_featured: true },
              take: 5,
              orderBy: { created_at: 'desc' },
              // F2-FaseP2 / T-P21: semua skalar kecil + `deskripsi` cuplikan
              // (kartu Featured render line-clamp, bukan teks penuh).
              select: {
                id: true, nama_usaha: true, slug: true, pemilik: true,
                kategori: true, deskripsi: true, alamat: true, kecamatan: true,
                whatsapp: true, logo: true, is_featured: true, created_at: true,
              },
            }),
            prisma.berita.findMany({
              take: 5,
              orderBy: { created_at: 'desc' },
              // F2-FaseP2 / T-P21: `konten` cuplikan (kartu render ≤160 char).
              select: {
                id: true, judul: true, slug: true, konten: true,
                thumbnail: true, author_id: true, created_at: true,
                author: { select: { name: true } },
              },
            }),
            prisma.galeri.findMany({ take: 6, orderBy: { created_at: 'desc' } }),
            // F-218 / audit §13.6: PERF-006 — fold the additional home-page
            // queries (UMKM count, produk count, profil snippet) into the
            // home-data fetch so the page can render in a single round-trip.
            prisma.uMKM.count(),
            prisma.produk.count(),
            // F2-FaseP2 / T-P20: profil via helper bersama (SATU key cache
            // `profil-publik` dengan layout/navbar/footer/CTA) — sebelumnya
            // findFirst 7-kolom sendiri = cache-entry + DB-hit dobel.
            getProfilPublik(),
          ])
        )
      )
      return {
        umkmFeatured: umkmFeaturedRows.map((u) => ({
          ...u,
          deskripsi: truncate(u.deskripsi, UMKM_DESKRIPSI_SNIPPET_LEN),
        })),
        beritaTerbaru: beritaTerbaruRows.map((b) => ({
          ...b,
          konten: toKontenSnippet(b.konten),
        })),
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

// ─── Profil Publik (dibagi layout + home + navbar/footer/CTA) ──
// F2-FaseP2 / T-P20: SATU helper, SATU key cache, SATU proyeksi untuk semua
// kebutuhan non-Text (nama wilayah, kontak, maps, statistik, periode,
// visi satu kalimat). Sebelumnya 3 proyeksi beda (layout 3 kolom, home 7
// kolom, komponen SELECT *) = 3 cache-entry + 3 DB-hit dingin untuk 1 baris
// yang sama. Kolom Text BERAT (sejarah_konten, misi legacy,
// struktur_organisasi) SENGAJA dikecualikan — pembutuhnya
// (sejarah/visi-misi) tetap memakai `getProfilLengkap` di bawah.
const PROFIL_PUBLIK_SELECT = {
  id: true,
  nama_desa: true,
  nama_kecamatan: true,
  nama_kabupaten: true,
  nama_provinsi: true,
  kode_pos: true,
  alamat_kantor: true,
  telepon: true,
  email: true,
  whatsapp: true,
  jam_pelayanan: true,
  maps_embed_url: true,
  maps_link: true,
  jumlah_penduduk: true,
  tahun_berdiri: true,
  periode_visi_misi: true,
  visi: true,
} as const

export const getProfilPublikCached = unstable_cache(
  async () => {
    try {
      return await prisma.profilDesa.findFirst({ select: PROFIL_PUBLIK_SELECT })
    } catch {
      // DB unreachable — caller punya fallback default
      return null
    }
  },
  ['profil-publik'],
  { revalidate: 3600, tags: [CACHE_TAGS.profil] }
)

/**
 * F2-FaseP2 / T-P20 — memo per-request di atas cache persisten: 5 pemanggil
 * (layout, home, navbar, footer, CTA) dalam 1 request = 1 eksekusi
 * (tanpanya, panggilan konkuren lolos semua sebagai MISS di dev).
 */
export const getProfilPublik = cache(() => getProfilPublikCached())

// ─── Misi items + pejabat (publik, ter-cache) ───────────────
// F2-FaseP2 / T-P20: sebelumnya `prisma.*` langsung di page profil
// (tanpa cache = query pooler tiap render). Invalidasi via tag `profil`
// (PUT profil revalidate; PUT pejabat ditambah revalidate — lihat route).
export const getMisiItems = (profilId: number) =>
  unstable_cache(
    async () => {
      try {
        return await prisma.misiItem.findMany({
          where: { profil_id: profilId },
          orderBy: { urutan: 'asc' },
        })
      } catch {
        return []
      }
    },
    ['misi-items', String(profilId)],
    { revalidate: 3600, tags: [CACHE_TAGS.profil] }
  )()

export const getPejabatList = unstable_cache(
  async () => {
    try {
      return await prisma.pejabatDesa.findMany({
        orderBy: [{ kategori: 'asc' }, { urutan: 'asc' }],
      })
    } catch {
      return []
    }
  },
  ['pejabat-list'],
  { revalidate: 300, tags: [CACHE_TAGS.profil] }
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
export const getBeritaPublik = (rawPage: number) => {
  // F2-FaseP2 / T-P21: normalisasi DI LUAR cache agar key selalu kanonik —
  // `?page=99999` dan `?page=500` berbagi 1 entri (bukan cache liar).
  const page = Math.min(PUBLIC_MAX_PAGE, clampPage(rawPage))
  return unstable_cache(
    async () => {
      try {
        const skip = (page - 1) * PUBLIC_PAGE_SIZE
        const [rows, total] = await timed('getBeritaPublik', prisma.$transaction([
          prisma.berita.findMany({
            skip,
            take: PUBLIC_PAGE_SIZE,
            orderBy: { created_at: 'desc' },
            // F2-FaseP2 / T-P21: `konten` cuplikan (list render ≤200 char).
            select: {
              id: true, judul: true, slug: true, konten: true,
              thumbnail: true, author_id: true, created_at: true,
              author: { select: { name: true } },
            },
          }),
          prisma.berita.count(),
        ]))
        const data = rows.map((b) => ({ ...b, konten: toKontenSnippet(b.konten) }))
        return { data, total, totalPages: Math.ceil(total / PUBLIC_PAGE_SIZE) }
      } catch {
        // DB unreachable — return empty page agar caller render empty state
        return { data: [], total: 0, totalPages: 0 }
      }
    },
    ['berita-publik', String(page)],
    { revalidate: 300, tags: [CACHE_TAGS.berita] }
  )()
}

// ─── Berita Detail ────────────────────────────────────────
export const getBeritaDetail = (slug: string) =>
  unstable_cache(
    async () => {
      try {
        const [berita, lainnyaRows] = await Promise.all([
          prisma.berita.findUnique({
            where: { slug },
            include: { author: { select: { name: true } } },
          }),
          prisma.berita.findMany({
            where: { slug: { not: slug } },
            take: 3,
            orderBy: { created_at: 'desc' },
            // F2-FaseP2 / T-P21: sidebar "lainnya" hanya pakai
            // judul/thumbnail/created_at — `konten` cuplikan.
            select: {
              id: true, judul: true, slug: true, konten: true,
              thumbnail: true, author_id: true, created_at: true,
              author: { select: { name: true } },
            },
          }),
        ])
        const lainnya = lainnyaRows.map((b) => ({ ...b, konten: toKontenSnippet(b.konten) }))
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

export interface UMKMPublikFilter {
  q?: string
  kategori?: string
}

export const getUMKMPublik = (rawPage: number, filter: UMKMPublikFilter = {}) => {
  // F2-FaseP2 / T-P21+T-P22: normalisasi DI LUAR cache (key kanonik) +
  // filter server-side (search + kategori) agar item halaman 2 ketemu
  // dari halaman 1 (sebelumnya filter in-memory per halaman = bug).
  const page = Math.min(PUBLIC_MAX_PAGE, clampPage(rawPage))
  const q = filter.q?.trim().slice(0, 100) ?? ''
  const kategori = filter.kategori?.trim() || undefined
  return unstable_cache(
    async () => {
      try {
        const skip = (page - 1) * PUBLIC_PAGE_SIZE
        const where: Prisma.UMKMWhereInput = {}
        if (kategori) where.kategori = kategori
        if (q) {
          where.OR = [
            { nama_usaha: { contains: q, mode: 'insensitive' } },
            { pemilik: { contains: q, mode: 'insensitive' } },
            { deskripsi: { contains: q, mode: 'insensitive' } },
          ]
        }
        const [rows, total, kategoriList] = await timed('getUMKMPublik', Promise.all([
          prisma.uMKM.findMany({
            where,
            skip,
            take: PUBLIC_PAGE_SIZE,
            orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
            // F2-FaseP2 / T-P21: skalar kecil + `_count`; `deskripsi`
            // cuplikan (kartu line-clamp, bukan teks penuh).
            select: {
              id: true, nama_usaha: true, slug: true, pemilik: true,
              kategori: true, deskripsi: true, alamat: true, kecamatan: true,
              whatsapp: true, logo: true, is_featured: true, created_at: true,
              _count: { select: { produk: true } },
            },
          }),
          prisma.uMKM.count({ where }),
          getUMKMKategori(),
        ]))
        const data = rows.map((u) => ({
          ...u,
          deskripsi: truncate(u.deskripsi, UMKM_DESKRIPSI_SNIPPET_LEN),
        }))
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
    ['umkm-publik', String(page), q, kategori ?? ''],
    { revalidate: 300, tags: [CACHE_TAGS.umkm] }
  )()
}

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
              // F2-FaseP2 / T-P21: kolom kartu katalog saja + batas
              // pengaman (tak ada UMKM yang medit 50 produk; tanpa take
              // satu UMKM raksasa bisa mengangkut ratusan baris).
              take: 50,
              select: {
                id: true, nama_produk: true, slug: true,
                deskripsi: true, harga: true, foto: true,
              },
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
          // F2-FaseP2 / T-P21: relasi UMKM hanya 6 kolom yang dipakai
          // halaman (nama/slug/logo/kategori/pemilik/whatsapp) —
          // bukan `umkm: true` dua tabel penuh.
          include: {
            umkm: {
              select: {
                nama_usaha: true, slug: true, logo: true, kategori: true,
                pemilik: true, whatsapp: true,
              },
            },
          },
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
          // F2-FaseP2 / T-P21: kolom grid relasi saja + order deterministik
          // (sebelumnya tanpa select/order — payload berlebih + urutan acak).
          orderBy: { created_at: 'desc' },
          select: { id: true, nama_produk: true, slug: true, harga: true, foto: true },
        })
      } catch {
        // DB unreachable — return empty array agar caller tidak crash
        return [] as Awaited<ReturnType<typeof prisma.produk.findMany>>
      }
    },
    ['produk-lain', String(umkmId), excludeSlug],
    { revalidate: 300, tags: [CACHE_TAGS.produk] }
  )()

// ─── Ulasan Produk (TASK-REV-01) ────────────────────────────
// Publik: hanya yang disetujui (is_approved) yang dibaca halaman produk.
// Admin: getUlasanPage untuk moderasi (tiru getPesanPage).
export const ULASAN_PUBLIK_TAKE = 5

export const getUlasanApproved = (produkId: number, take = ULASAN_PUBLIK_TAKE) =>
  unstable_cache(
    async () => {
      try {
        return prisma.ulasan.findMany({
          where: { produk_id: produkId, is_approved: true },
          take,
          orderBy: { created_at: 'desc' },
          select: { id: true, nama: true, rating: true, komentar: true, created_at: true },
        })
      } catch {
        return [] as Awaited<ReturnType<typeof prisma.ulasan.findMany>>
      }
    },
    ['ulasan-produk', String(produkId), String(take)],
    { revalidate: 300, tags: [CACHE_TAGS.produk] }
  )()

export const getProdukRating = (produkId: number) =>
  unstable_cache(
    async (): Promise<{ value: number; count: number } | null> => {
      try {
        const agg = await prisma.ulasan.aggregate({
          _avg: { rating: true },
          _count: true,
          where: { produk_id: produkId, is_approved: true },
        })
        if (!agg._count || agg._avg.rating == null) return null
        return { value: Math.round(agg._avg.rating * 10) / 10, count: agg._count }
      } catch {
        return null
      }
    },
    ['produk-rating', String(produkId)],
    { revalidate: 300, tags: [CACHE_TAGS.produk] }
  )()

export const getUlasanPage = (rawPage: number, search = '') => {
  const page = clampPage(rawPage)
  const q = search.trim().slice(0, 100)
  return unstable_cache(
    async () => {
      const where: Prisma.UlasanWhereInput = q
        ? {
            OR: [
              { nama: { contains: q, mode: 'insensitive' as const } },
              { komentar: { contains: q, mode: 'insensitive' as const } },
              { produk: { nama_produk: { contains: q, mode: 'insensitive' as const } } },
            ],
          }
        : {}
      const [data, total, pending] = await timed('getUlasanPage', prisma.$transaction([
        prisma.ulasan.findMany({
          where,
          take: PAGE_SIZE,
          skip: (page - 1) * PAGE_SIZE,
          orderBy: { created_at: 'desc' },
          select: {
            id: true, nama: true, rating: true, komentar: true,
            is_approved: true, created_at: true,
            produk: { select: { id: true, nama_produk: true, slug: true } },
          },
        }),
        prisma.ulasan.count({ where }),
        prisma.ulasan.count({ where: { is_approved: false } }),
      ]))
      return { data, total, pending, totalPages: Math.ceil(total / PAGE_SIZE) }
    },
    ['ulasan-page', String(page), q],
    { revalidate: 10, tags: [CACHE_TAGS.produk] }
  )()
}