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
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: opts.judul,
    description: opts.deskripsi ?? opts.judul,
    image: opts.thumbnail ? [opts.thumbnail] : undefined,
    datePublished: typeof opts.tanggal === 'string' ? opts.tanggal : opts.tanggal.toISOString(),
    dateModified: (typeof opts.updated === 'string' ? opts.updated : opts.updated?.toISOString?.()) ??
      (typeof opts.tanggal === 'string' ? opts.tanggal : opts.tanggal.toISOString()),
    author: { '@type': 'Person', name: opts.author },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE.url}/berita/${opts.slug}`,
    },
    inLanguage: 'id-ID',
  }
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
  tersedia: boolean
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.nama,
    description: opts.deskripsi,
    image: opts.foto ? [opts.foto] : undefined,
    sku: opts.slug,
    brand: { '@type': 'Brand', name: opts.umkm_nama },
    offers: {
      '@type': 'Offer',
      url: `${SITE.url}/umkm/${opts.umkm_slug}/produk/${opts.slug}`,
      priceCurrency: 'IDR',
      price: opts.harga,
      availability: opts.tersedia
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@id': ORG_ID },
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
    image: opts.foto ? [opts.foto] : undefined,
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
