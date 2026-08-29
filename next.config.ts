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
  // Allow fetch to Sentry and Supabase for future OBS-001 / DB
  "connect-src 'self' https://*.sentry.io https://*.supabase.co wss://*.supabase.co https://*.vercel-insights.com",
  // No iframes allowed
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
    value: 'max-age=31536000; includeSubDomains',
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
  images: {
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
