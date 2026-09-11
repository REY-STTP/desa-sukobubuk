/**
 * Schema.org JSON-LD generators — SEO + AEO (Answer Engine Optimization).
 *
 * Setiap helper mengembalikan object siap-serialize. Di-embed di page
 * via <script type="application/ld+json"> di layout/page.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.desa-sukobubuk.web.id').replace(/\/$/, '')

export const SITE = {
  url: SITE_URL,
  name: 'Desa Sukobubuk',
  description:
    'Website resmi Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah.',
} as const

export const ORG_ID = `${SITE.url}#organization`
export const WEBSITE_ID = `${SITE.url}#website`

const DEFAULT_IMAGE = `${SITE.url}/og-image.webp`
const ORG_LOGO = `${SITE.url}/icons/icon-512.png`

/** Jadikan URL absolut. Cloudinary sudah absolut; path `/...` di-prefix SITE.url. */
function absUrl(u?: string | null): string | undefined {
  if (!u) return undefined
  if (/^https?:\/\//i.test(u)) return u
  if (u.startsWith('/')) return `${SITE.url}${u}`
  return `${SITE.url}/${u}`
}

/**
 * Selalu kembalikan minimal 1 image absolut agar lolos Rich Results Test.
 * Rantai fallback: foto utama → fallback (logo UMKM) → og-image default.
 */
function imageList(primary?: string | null, fallback?: string | null): string[] {
  const img = absUrl(primary) ?? absUrl(fallback) ?? DEFAULT_IMAGE
  return [img]
}

/** BreadcrumbList untuk navigasi */
export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: `${SITE.url}${it.url}`,
    })),
  }
}

/** Article schema untuk halaman berita */
export function articleLd(opts: {
  slug: string
  judul: string
  deskripsi?: string
  thumbnail?: string | null
  tanggal: Date | string
  updated?: Date | string
  author: string
}) {
  const pageUrl = `${SITE.url}/berita/${opts.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: opts.judul,
    description: opts.deskripsi ?? opts.judul,
    // FIX-SEO-1: image wajib ada + absolut (fallback og-image bila tanpa thumbnail),
    // url top-level, author.url, publisher inline (validator tak resolve @id lintas blok).
    image: imageList(opts.thumbnail),
    url: pageUrl,
    datePublished: typeof opts.tanggal === 'string' ? opts.tanggal : opts.tanggal.toISOString(),
    dateModified: (typeof opts.updated === 'string' ? opts.updated : opts.updated?.toISOString?.()) ??
      (typeof opts.tanggal === 'string' ? opts.tanggal : opts.tanggal.toISOString()),
    // Tidak ada halaman profil penulis publik → tautkan ke situs desa (jujur, bukan URL karangan per-author).
    author: { '@type': 'Person', name: opts.author, url: SITE.url },
    // Publisher standalone TANPA @id: layout sudah mendefinisikan
    // ORG_ID (#organization) dengan name 'Desa Sukobubuk'. Memakai @id yang
    // sama di sini dengan name berbeda ('Pemerintah Desa...') membuat Google
    // me-merge node dan melaporkan "Kolom 'name' memiliki duplikat".
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
      logo: { '@type': 'ImageObject', url: ORG_LOGO, width: 512, height: 512 },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl,
    },
    inLanguage: 'id-ID',
  }
}

/** Tipe ulasan untuk JSON-LD Product (TASK-REV-01). Hanya diisi dari
 * ulasan disetujui yang juga dirender di HTML — syarat review snippet Google. */
export interface ProductReviewLd {
  author: string
  rating: number
  body: string
  date: string
}

/** Product schema untuk halaman produk UMKM */
export function productLd(opts: {
  slug: string
  nama: string
  deskripsi: string
  harga: number
  foto?: string | null
  umkm_nama: string
  umkm_slug: string
  umkm_logo?: string | null
  tersedia: boolean
  rating?: { value: number; count: number } | null
  reviews?: ProductReviewLd[]
}) {
  const hasRating = !!opts.rating && opts.rating.count > 0
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.nama,
    description: opts.deskripsi,
    // FIX-SEO-3b: image wajib di merchant-listing → fallback foto → logo UMKM → og-image.
    image: imageList(opts.foto, opts.umkm_logo),
    sku: opts.slug,
    brand: { '@type': 'Brand', name: opts.umkm_nama },
    // TASK-REV-01: aggregateRating + review hanya bila ada ulasan disetujui
    // (count >= 1). Produk tanpa ulasan kembali ke merchant-listing murni.
    ...(hasRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: opts.rating!.value,
            reviewCount: opts.rating!.count,
          },
          review: (opts.reviews ?? []).slice(0, 5).map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.author },
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
            reviewBody: r.body,
            datePublished: r.date,
          })),
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE.url}/umkm/${opts.umkm_slug}/produk/${opts.slug}`,
      priceCurrency: 'IDR',
      price: opts.harga,
      itemCondition: 'https://schema.org/NewCondition',
      availability: opts.tersedia
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@id': ORG_ID },
      // Model jualan: via WhatsApp / ambil langsung / COD. Ongkir di luar
      // desa dikonfirmasi via chat — shippingRate 0 = ambil di tempat,
      // bukan klaim "gratis ongkir ke seluruh Indonesia". Sesuaikan angka
      // ini bila UMKM menetapkan tarif ekspedisi tetap.
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'IDR' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'ID' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
        },
      },
      // Kebijakan default konservatif: 7 hari, kembalikan ke toko/hubungi
      // penjual via WA, ongkos return ditanggung pembeli. Sesuaikan bila
      // tiap UMKM punya kebijakan tertulis berbeda.
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'ID',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnInStore',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
      },
    },
  }
}

/**
 * F-305 / GEO-002 — Phase 05 — derive a `priceRange` from the
 * `produk.harga` values. Returns `$` (cheap, < Rp 50k), `$$` (moderate,
 * < Rp 500k), or `$$$` (premium). Returns `null` when there are no
 * products (caller should omit the field).
 */
export function priceRangeFor(hargas: number[]): '$' | '$$' | '$$$' | null {
  if (hargas.length === 0) return null
  const min = Math.min(...hargas)
  if (min < 50_000) return '$'
  if (min < 500_000) return '$$'
  return '$$$'
}

/** LocalBusiness schema untuk halaman UMKM */
export function localBusinessLd(opts: {
  slug: string
  nama: string
  deskripsi: string
  alamat: string
  whatsapp: string
  foto?: string | null
  kategori: string
  kecamatan?: string | null
  priceRange?: '$' | '$$' | '$$$' | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/umkm/${opts.slug}#business`,
    name: opts.nama,
    description: opts.deskripsi,
    // FIX-SEO-2: image jangan pernah hilang → fallback og-image bila tanpa logo.
    image: imageList(opts.foto),
    url: `${SITE.url}/umkm/${opts.slug}`,
    telephone: opts.whatsapp ? `+${opts.whatsapp}` : undefined,
    priceRange: opts.priceRange ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: opts.alamat,
      // GEO-001 / F-212 — use per-UMKM kecamatan, fall back to
      // 'Margorejo' (canonical kecamatan for Desa Sukobubuk) when null.
      addressLocality: opts.kecamatan ?? 'Margorejo',
      addressRegion: 'Jawa Tengah',
      postalCode: '59163',
      addressCountry: 'ID',
    },
    parentOrganization: { '@id': ORG_ID },
    category: opts.kategori,
  }
}

/** ContactPage schema untuk halaman kontak */
export function contactPageLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE.url}/kontak#contactpage`,
    url: `${SITE.url}/kontak`,
    name: 'Kontak Desa Sukobubuk',
    description: 'Hubungi Pemerintah Desa Sukobubuk untuk pertanyaan, kritik, dan masukan.',
    inLanguage: 'id-ID',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    about: { '@id': ORG_ID },
  }
}

/** FAQPage schema — AEO (Answer Engine Optimization)
 * Pasang di halaman yang punya Q&A agar AI search bisa jawab langsung.
 * `speakable` opsional: tunjuk DOM path yang paling cocok untuk voice/TTS.
 */
export function faqLd(
  items: { q: string; a: string }[],
  options: { speakableXpath?: string[] } = {}
) {
  const base: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.a,
      },
    })),
  }
  if (options.speakableXpath && options.speakableXpath.length > 0) {
    base.speakable = {
      '@type': 'SpeakableSpecification',
      xpath: options.speakableXpath,
    }
  }
  return base
}

/** Helper untuk serialize ke <script> tag.
 *
 * P0-2: escape `<` menjadi `\u003c`. Tanpa ini, string seperti
 * `</script>` di dalam data (mis. judul berita dari admin) akan menutup
 * blok JSON-LD dan memungkinkan stored XSS — dan CSP mengizinkan
 * `script-src 'unsafe-inline'` sehingga payload langsung eksekusi.
 * `\u003c` valid dalam JSON dan diurai kembali menjadi `<` oleh parser
 * JSON-LD, jadi makna data terstruktur tidak berubah.
 */
export function ldScript(obj: object) {
  return {
    __html: JSON.stringify(obj).replace(/</g, '\\u003c'),
  }
}
