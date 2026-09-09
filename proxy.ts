import { auth, isPublicAdminPath } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { setRequestId } from '@/lib/logger'
import crypto from 'node:crypto'

/**
 * F-109 / OBS-002 — generate a request-id and pass it via header.
 *
 * `setRequestId` stores the id in module scope on the server so that
 * `lib/logger` includes it in every subsequent log line during this
 * request. We also set the `x-request-id` response header so clients
 * can correlate.
 *
 * Auth.js v5 (migrasi dari `withAuth` v4): `auth()` membungkus proxy dan
 * menjalankan callback `authorized` di `lib/auth.ts` terlebih dahulu.
 *
 * P0-1 (kritis): next-auth@beta.32 TIDAK menghormati `authorized === false`
 * saat middleware kustom dibungkus — rantai `else if (userMiddlewareOrRoute)`
 * / `else if (!authorized)` di `handleAuth` (`node_modules/next-auth/lib/
 * index.js`) selalu menjalankan fungsi kustom dan melewatkan redirect.
 * Tanpa gate eksplisit di bawah, sesi revoke (`user.id === ''`) lolos ke
 * halaman admin (layout hanya cek sesi non-null). Gate memakai `req.auth`
 * yang sudah diaugmentasi Auth.js — penegak yang sebenarnya; `authorized`
 * tetap dipertahankan sebagai backstop + dokumentasi.
 */
const REQUEST_ID_HEADER = 'x-request-id'

/** Host yang dilewati dari redirect kanonis (dev/lokal). */
const BYPASS_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]'])

function hostTanpaPort(host: string): string {
  // Buang port (:3000) + normalisasi; tangani IPv6 [::1]:3000.
  const h = host.trim().toLowerCase()
  if (h.startsWith('[')) return h.split(']')[0] + ']'
  return h.split(':')[0]
}

export default auth((req) => {
  // P2-F3: SELALU generate baru — nilai `x-request-id`/`x-vercel-id` dari
  // klien tidak lagi dipercaya (pemalsuan/collision meracuni korelasi log).
  // Korelasi log adalah milik server.
  const id = crypto.randomUUID()
  setRequestId(id)

  // P2-H3: paksa satu domain kanonis (SEO: nol duplikat www-vs-apex;
  // sesi/cookie konsisten satu host). BERJALAN SEBELUM gate admin agar
  // redirect penolakan pun sudah ber-host kanonis.
  const canonical = process.env.NEXT_PUBLIC_SITE_URL
  if (canonical) {
    try {
      const canonicalUrl = new URL(canonical)
      const canonicalHost = canonicalUrl.host.toLowerCase()
      const fwd = req.headers.get('x-forwarded-host')
      const reqHost = hostTanpaPort(fwd?.split(',')[0] ?? req.headers.get('host') ?? '')
      const isProd =
        process.env.VERCEL_ENV === 'production' ||
        (!process.env.VERCEL_ENV && process.env.NODE_ENV === 'production')
      const method = req.method.toUpperCase()
      if (
        isProd &&
        !BYPASS_HOSTS.has(reqHost) &&
        reqHost !== '' &&
        reqHost !== canonicalHost &&
        (method === 'GET' || method === 'HEAD')
      ) {
        const target = new URL(req.nextUrl.pathname + req.nextUrl.search, canonicalUrl.origin)
        const res = NextResponse.redirect(target, 308)
        res.headers.set(REQUEST_ID_HEADER, id)
        return res
      }
    } catch {
      // canonical tak valid / parsing gagal → fail-open (perilaku lama).
    }
  }

  const { pathname } = req.nextUrl
  // P0-1: gate admin eksplisit. `/api/admin/*` tidak tercakup (pathname-nya
  // diawali `/api`, bukan `/admin`) — dijaga `requireAdmin()` per route.
  if (
    pathname.startsWith('/admin') &&
    !isPublicAdminPath(pathname) &&
    !req.auth?.user?.id
  ) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('callbackUrl', req.nextUrl.href)
    const denied = NextResponse.redirect(url)
    denied.headers.set(REQUEST_ID_HEADER, id)
    return denied
  }

  const res = NextResponse.next()
  res.headers.set(REQUEST_ID_HEADER, id)
  return res
})

export const config = {
  // OBS-002: also match public API routes and pages so the request-id
  // is set for every request that may log via `lib/logger`.
  matcher: ['/((?!_next/|favicon.ico|images/|llms|llms-full|og-image|icon|apple-icon|manifest).*)'],
}
