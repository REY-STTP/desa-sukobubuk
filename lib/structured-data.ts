/**
 * Schema.org JSON-LD generators — SEO + AEO (Answer Engine Optimization).
 *
 * Setiap helper mengembalikan object siap-serialize. Di-embed di page
 * via <script type="application/ld+json"> di layout/page.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desa-sukobubuk.id').replace(/\/$/, '')

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

/** LocalBusiness schema untuk halaman UMKM */
export function localBusinessLd(opts: {
  slug: string
  nama: string
  deskripsi: string
  alamat: string
  whatsapp: string
  foto?: string | null
  kategori: string
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
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: opts.alamat,
      addressLocality: 'Margorejo',
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
 */
export function faqLd(items: { q: string; a: string }[]) {
  return {
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
}

/** Helper untuk serialize ke <script> tag */
export function ldScript(obj: object) {
  return {
    __html: JSON.stringify(obj),
  }
}
