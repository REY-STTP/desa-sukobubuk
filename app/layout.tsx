import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
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
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

/**
 * Domain production untuk OG, sitemap, JSON-LD, canonical.
 * NEXT_PUBLIC_SITE_URL WAJIB di-set (Vercel env).
 * Fallback ke localhost untuk dev.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
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
  formatDetection: { email: false, address: false, telephone: false },
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
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Desa Sukobubuk — Portal Resmi Pemerintah Desa',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@desasukobubuk',
    creator: '@desasukobubuk',
    title: 'Desa Sukobubuk – Kecamatan Margorejo, Kabupaten Pati',
    description: SITE_DESC,
    images: ['/og-image.png'],
  },
  facebook: { appId: 'desa-sukobubuk' },
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
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
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
        url: `${SITE_URL}/icon.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/og-image.png`,
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
      '@type': 'LocalBusiness',
      '@id': `${SITE_URL}#localbusiness`,
      '@parent': `${SITE_URL}#organization`,
      name: 'Kantor Desa Sukobubuk',
      image: `${SITE_URL}/og-image.png`,
      url: SITE_URL,
      telephone: '+62-295-123456',
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
          closes: '15:00',
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}
    >
      <head>
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-friendly summary" />
        <link rel="alternate" type="text/plain" href="/llms-full.txt" title="LLM-friendly full reference" />
        <script
          type="application/ld+json"
          // schema.org JSON-LD untuk Organization + WebSite + LocalBusiness
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Lewati ke konten utama
        </a>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
