import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import { ldScript } from '@/lib/structured-data'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
})
// P3-I2: JetBrains_Mono dihapus (satu request font hemat) — `font-mono`
// kini stack sistem (lihat --font-mono di globals.css).

/**
 * Domain production untuk OG, sitemap, JSON-LD, canonical.
 * NEXT_PUBLIC_SITE_URL WAJIB di-set (Vercel env).
 * Fallback = kanonis www (jangan localhost agar canonical/OG tak bocor).
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.desa-sukobubuk.web.id').replace(/\/$/, '')
const SITE_NAME = 'Desa Sukobubuk'
const SITE_DESC =
  'Website resmi Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah. Kode Pos 59163. Profil desa, sejarah, visi-misi, struktur organisasi, berita, UMKM, dan layanan administrasi.'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafaf7' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2a1a' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Desa Sukobubuk – Kecamatan Margorejo, Kabupaten Pati',
    template: '%s | Desa Sukobubuk',
  },
  description: SITE_DESC,
  keywords: [
    'Desa Sukobubuk',
    'Sukobubuk',
    'Kecamatan Margorejo',
    'Kabupaten Pati',
    'Jawa Tengah',
    'desa digital',
    'website desa',
    'profil desa',
    'UMKM desa',
    'berita desa',
    'Kode Pos 59163',
    'Margorejo Pati',
    'pemerintah desa',
  ],
  authors: [{ name: 'Pemerintah Desa Sukobubuk' }],
  creator: 'Pemerintah Desa Sukobubuk',
  publisher: 'Pemerintah Desa Sukobubuk',
  applicationName: SITE_NAME,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  // P2-G2: telephone true agar iOS auto-link nomor (sejalan kontak tel:);
  // email false (hindari link sembarangan pada teks ber-@).
  formatDetection: { email: false, address: false, telephone: true },
  category: 'Government',
  classification: 'Government',
  alternates: {
    canonical: '/',
    languages: {
      'id-ID': SITE_URL,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Desa Sukobubuk – Kecamatan Margorejo, Kabupaten Pati',
    description: SITE_DESC,
    countryName: 'ID',
    emails: ['admin.desa.sukobubuk@gmail.com'],
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Desa Sukobubuk — Portal Resmi Pemerintah Desa',
        type: 'image/webp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    // P1-D4: akun X/Twitter resmi belum ada (hanya IG/TikTok KKN) —
    // site/creator fiktif dihapus daripada menyesatkan.
    title: 'Desa Sukobubuk – Kecamatan Margorejo, Kabupaten Pati',
    description: SITE_DESC,
    images: ['/og-image.webp'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    // P1-C1: favicon 64px teroptimasi (dulu duplikat logo 533KB).
    icon: [{ url: '/icon.png', type: 'image/png', sizes: '64x64' }],
    apple: '/apple-icon.png',
    shortcut: '/icon.png',
  },
  manifest: '/manifest.json',
  other: {
    'geo.region': 'ID-JT',
    'geo.placename': 'Desa Sukobubuk, Margorejo, Pati, Jawa Tengah',
    'geo.position': '-6.74;111.04',
    ICBM: '-6.74, 111.04',
    'content-language': 'id',
    'audience': 'all',
    'rating': 'general',
    'distribution': 'global',
    'revisit-after': '3 days',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    // Bing TIDAK punya key khusus di tipe Verification (hanya
    // google/yahoo/yandex/me/other) — key `bing:` diam-diam diabaikan
    // Next saat render (dan lolos tsc karena spread menghindari
    // excess-property check). Jalur yang benar: `other`.
    other: {
      ...(process.env.BING_SITE_VERIFICATION
        ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
        : {}),
    },
  },
}

/** Schema.org JSON-LD — root layout (Organization + WebSite + LocalGovernment) */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'GovernmentOrganization'],
      '@id': `${SITE_URL}#organization`,
      name: SITE_NAME,
      alternateName: 'Pemerintah Desa Sukobubuk',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icons/icon-512.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/og-image.webp`,
      description: SITE_DESC,
      email: 'admin.desa.sukobubuk@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Jl. Raya Sukobubuk',
        addressLocality: 'Margorejo',
        addressRegion: 'Jawa Tengah',
        postalCode: '59163',
        addressCountry: 'ID',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -6.74,
        longitude: 111.04,
      },
      sameAs: [
        'https://instagram.com/kkn.sttpsukobubuk',
        'https://tiktok.com/@kknsttp.sukobubuk',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'admin.desa.sukobubuk@gmail.com',
        availableLanguage: ['Indonesian'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESC,
      inLanguage: 'id-ID',
      publisher: { '@id': `${SITE_URL}#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/berita?search={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      // P1-D4: GovernmentOffice (bukan LocalBusiness) + kontak kanonis repo
      // (WA desa dari seed, bukan nomor fiktif) + jam = seed 08.00–12.00.
      '@type': 'GovernmentOffice',
      '@id': `${SITE_URL}#localbusiness`,
      '@parent': `${SITE_URL}#organization`,
      name: 'Kantor Desa Sukobubuk',
      image: `${SITE_URL}/og-image.webp`,
      url: SITE_URL,
      telephone: '+6281328733023',
      email: 'admin.desa.sukobubuk@gmail.com',
      priceRange: 'Gratis',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Jl. Raya Sukobubuk',
        addressLocality: 'Margorejo',
        addressRegion: 'Jawa Tengah',
        postalCode: '59163',
        addressCountry: 'ID',
      },
      geo: { '@type': 'GeoCoordinates', latitude: -6.74, longitude: 111.04 },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '12:00',
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-friendly summary" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM-friendly full reference" />
        <script
          type="application/ld+json"
          // schema.org JSON-LD untuk Organization + WebSite + GovernmentOffice.
          // P0-2: lewat ldScript agar `<` di-escape (tahan stored XSS).
          dangerouslySetInnerHTML={ldScript(jsonLd)}
        />
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Lewati ke konten utama
        </a>
        {children}
      </body>
    </html>
  )
}
