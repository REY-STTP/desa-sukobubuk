import type { NextConfig } from 'next'

const csp = [
  "default-src 'self'",
  // Cloudinary images, plus data: for inline placeholders
  "img-src 'self' data: blob: https://res.cloudinary.com",
  // Next.js streamed RSC requires unsafe-inline for the bootstrap script.
  // Vercel Insights is permitted in production only (added by environment).
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-insights.com",
  // Tailwind + Framer Motion rely on inline style attributes; permit unsafe-inline
  "style-src 'self' 'unsafe-inline'",
  // Google Fonts (next/font/google self-hosts, but data: is used for fallbacks)
  "font-src 'self' data:",
  // Footer mini-map embeds Google Maps — allow framing its embed domains.
  // Tanpa ini, `default-src 'self'` membuat browser menolak iframe peta.
  "frame-src https://www.google.com https://maps.google.com",
  // Hero background video (<video>) — tanpa ini browser menolak media
  // Cloudinary karena fallback ke `default-src 'self'` (poster lolos via
  // img-src, sehingga videonya tampak diam).
  "media-src 'self' https://res.cloudinary.com",
  // Allow fetch to Sentry and Supabase for future OBS-001 / DB
  "connect-src 'self' https://*.sentry.io https://*.supabase.co wss://*.supabase.co https://*.vercel-insights.com",
  // P2-H2: blokir plugin/Flash era lama (tak ada <object>/<embed> di kode).
  "object-src 'none'",
  // Hanya Google Maps yang boleh di-frame (mini-map footer). frame-ancestors
  // di bawah tetap 'none': situs ini tak boleh di-frame pihak lain.
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Disable Flash of unstyled content downloads of mixed content
  "block-all-mixed-content",
  // Upgrade insecure requests when running on HTTPS
  "upgrade-insecure-requests",
].join('; ')

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: csp,
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'off',
  },
]

const nextConfig: NextConfig = {
  // F2-Fase4 / T-42 — rampingkan impor barrel ikon (tiap file admin impor
  // 6-15 ikon dari 'lucide-react'). Hanya lucide-react dulu; `radix-ui`
  // meta-package dievaluasi terpisah (risiko tree-shaking, lihat TASKS).
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Hapus console.* produksi kecuali error/warn (logger error tetap hidup).
  compiler: {
    removeConsole: { exclude: ['error', 'warn'] },
  },
  images: {
    // F-106 / PERF-001 follow-up: enable modern formats for Cloudinary +
    // any other remote image. Next.js will negotiate AVIF → WebP → JPEG.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Cloudinary
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Localhost
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  // P2-H2: IP LAN hanya untuk dev (uji via HP/tablet se-jaringan).
  // Dibungkus NODE_ENV agar tak bocor ke config production.
  ...(process.env.NODE_ENV === 'development'
    ? { allowedDevOrigins: ['192.168.100.12'] }
    : {}),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
