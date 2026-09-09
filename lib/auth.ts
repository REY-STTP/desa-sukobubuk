import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { isLockedOut, recordFailedLogin, clearFailedLogins } from '@/lib/auth-lockout'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import bcrypt from 'bcryptjs'

/**
 * Auth.js v5 (next-auth@5) — JWT + Credentials.
 *
 * Migrasi dari NextAuth v4. Yang berubah vs v4:
 * - `NextAuthOptions` + `NextAuth(authOptions)` → `NextAuth(config)` yang
 *   mengekspor `handlers` (route `api/auth/[...nextauth]`), `auth()` (pengganti
 *   `getServerSession` — dipakai `lib/admin-guard.ts` + layout admin), serta
 *   `signIn`/`signOut` helper server.
 * - `secret` dibaca otomatis dari env `AUTH_SECRET` (pengganti
 *   `NEXTAUTH_SECRET`). Nilai lama TIDAK bisa dipakai ulang tanpa memaksa
 *   semua admin login ulang (JWT di-sign ulang + prefix cookie berubah
 *   `next-auth.*` → `authjs.*`).
 * - `trustHost: true` WAJIB di production (Vercel/reverse proxy) agar Auth.js
 *   tidak melempar `UntrustedHost` — v4 tidak membutuhkan ini.
 * - `withAuth` + `authorized({ token })` di `proxy.ts` digantikan callback
 *   `authorized({ auth, request })` di bawah + wrapper `auth()` di `proxy.ts`.
 * - `authorize(credentials, request)`: `request` adalah Web Request standar
 *   (baca header via `Headers.get`), dan tiap field `credentials` bertipe
 *   `unknown` sehingga perlu validasi tipe eksplisit.
 *
 * Yang dipertahankan dari v4: rate-limit 5/20 (SEC-008), DB lockout
 * (AUTH-002), anti-enumeration, snapshot + pengecekan `session_version`
 * (AUTH-003, fail-closed), bump `session_version` saat signOut.
 */

/**
 * P0-1: daftar path admin yang boleh diakses tanpa sesi. Dipakai bersama
 * oleh callback `authorized` di bawah dan gate eksplisit di `proxy.ts`.
 * (next-auth@beta.32 mengabaikan hasil `authorized === false` saat
 * middleware kustom dibungkus — lihat `handleAuth`, rantai
 * `else if (userMiddlewareOrRoute)` / `else if (!authorized)` di
 * `node_modules/next-auth/lib/index.js`. Gate di `proxy.ts` memakai
 * `req.auth` adalah penegak yang sebenarnya; `authorized` tetap ada
 * sebagai dokumentasi + backstop.)
 */
export function isPublicAdminPath(pathname: string): boolean {
  return (
    pathname === '/admin/login' ||
    pathname === '/admin/lupa-password' ||
    pathname.startsWith('/admin/reset-password')
  )
}
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // P0-1: batasi umur JWT 12 jam (rolling tiap 1 jam) agar jendela replay
  // token curian pendek. Sebelumnya mengandalkan default (~30 hari).
  session: { strategy: 'jwt', maxAge: 12 * 60 * 60, updateAge: 60 * 60 },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        const email = typeof credentials?.email === 'string' ? credentials.email : ''
        const password = typeof credentials?.password === 'string' ? credentials.password : ''
        if (!email || !password) return null

        const fwd = request.headers.get('x-forwarded-for')
        const ip =
          fwd?.split(',')[0]?.trim() ||
          request.headers.get('x-real-ip') ||
          'unknown'
        const emailLower = email.toLowerCase()

        // F-103: SEC-008 — limit to 5 attempts / 15 min / (IP + email) +
        // 20 attempts / 15 min / IP (prevents email-rotation bypass).
        const rlEmail = rateLimit({
          key: `login:${ip}:${emailLower}`,
          limit: 5,
          windowSec: 15 * 60,
        })
        const rlIp = rateLimit({
          key: `login:ip:${ip}`,
          limit: 20,
          windowSec: 15 * 60,
        })
        if (!rlEmail.ok || !rlIp.ok) {
          // Don't leak whether the email exists; return null.
          return null
        }

        // F-209 / AUTH-002 — DB-backed lockout based on the email.
        if (await isLockedOut(emailLower)) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: emailLower },
        })

        if (!user) {
          // Record a failed attempt for unknown email too — this prevents
          // enumeration by timing difference.
          await recordFailedLogin({ email: emailLower, ip })
          return null
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          await recordFailedLogin({ email: emailLower, ip, userId: user.id })
          return null
        }

        // Successful login — clear any prior failed-login records.
        await clearFailedLogins(emailLower)

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
          // F-209 / AUTH-003: snapshot the session version at sign-in.
          sessionVersion: user.session_version,
        }
      },
    }),
  ],
  callbacks: {
    // Gate untuk `proxy.ts` — logika identik dengan `withAuth(authorized)`
    // v4: selalu lolos untuk non-/admin + halaman auth publik, selain itu
    // butuh user terautentikasi. Route `/api/admin/*` tetap dijaga oleh
    // `requireAdmin()` di tiap route handler (pathname-nya tidak diawali
    // `/admin` sehingga tidak tercakup di sini — sama seperti v4).
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      // Public routes — always allow.
      if (!pathname.startsWith('/admin')) return true
      // Izinkan akses ke login, lupa-password, reset-password tanpa token.
      if (isPublicAdminPath(pathname)) {
        return true
      }
      // Semua route /admin/* lainnya harus login. P0-1: cek `user.id`
      // (bukan sekadar `user`) — token revoke tiba sebagai `{ id: '',
      // role: 'ADMIN' }` dan `!!auth?.user` saja akan meloloskannya.
      return !!auth?.user?.id
    },
    async jwt({ token, user }) {
      if (user) {
        // v5: `User.id` bertipe opsional di @auth/core, sementara JWT kita
        // mewajibkan `id: string` (lihat `types/next-auth.d.ts`). `authorize()`
        // di atas selalu mengembalikan id, jadi fallback '' tak terjangkau
        // saat runtime — dan guard `if (token.id)` di bawah membuatnya
        // fail-closed andaipun terjadi.
        token.id = user.id ?? ''
        // `user` bertipe `User` generik; field kustom `role`/`sessionVersion`
        // berasal dari return value `authorize()` di atas.
        token.role = (user as { role?: 'ADMIN' }).role ?? token.role
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0
      }
      // F-209 / AUTH-003: on every request, check that the JWT's
      // sessionVersion still matches the latest value in the DB. If not,
      // return an empty token to force re-authentication.
      // NOTE: Old JWTs issued before the migration have sessionVersion ===
      // undefined. They are treated as stale and forced to re-authenticate,
      // which matches the migration comment in
      // prisma/migrations/20260829_add_session_version_and_failed_logins.
      if (token.id) {
        if (typeof token.sessionVersion !== 'number') {
          return { ...token, id: '', role: 'ADMIN', sessionVersion: -1 }
        }
        try {
          // F-217: PERF-007 — wrap in `withDbRetry` so a transient
          // Supabase pooler error gets one retry before we fail closed.
          const { withDbRetry } = await import('@/lib/db-retry')
          const u = await withDbRetry(() =>
            prisma.user.findUnique({
              where: { id: Number(token.id) },
              select: { session_version: true },
            })
          )
          if (!u || u.session_version !== token.sessionVersion) {
            // Return an empty (inert) token. Catatan P0-1: Auth.js TIDAK
            // otomatis menganggap ini logout — yang membuatnya tidak
            // berdaya adalah guard yang menolak `id` kosong
            // (`requireAdmin` + `authorized`). Jangan hapus cek id di sana.
            return { ...token, id: '', role: 'ADMIN', sessionVersion: -1 }
          }
        } catch (err) {
          // DB unavailable: fail closed — reject the session rather than
          // serving possibly-revoked content (token inert, lihat di atas).
          logger.error('session_version check failed', {
            userId: token.id,
            err: (err as Error)?.message ?? String(err),
          })
          return { ...token, id: '', role: 'ADMIN', sessionVersion: -1 }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        // `token.id` and `token.role` are typed via `types/next-auth.d.ts`.
        session.user.id = token.id
        session.user.role = token.role
        session.sessionVersion = token.sessionVersion
      }
      return session
    },
  },
  events: {
    // F-209 / AUTH-003: bump `User.session_version` on signOut. The next
    // request that reads this user's JWT will see the mismatch and the
    // `jwt` callback above will reject the token, forcing re-auth.
    //
    // v5: message event adalah union `{ session } | { token }` — strategi
    // JWT (yang kita pakai) selalu membawa `token`, strategi database
    // membawa `session`. Narrowing via `in` agar type-safe di keduanya.
    async signOut(message) {
      const token = 'token' in message ? message.token : undefined
      try {
        if (token?.id) {
          const userId = Number(token.id)
          if (Number.isFinite(userId) && userId > 0) {
            await prisma.user.update({
              where: { id: userId },
              data: { session_version: { increment: 1 } },
            })
          }
        }
      } catch (err) {
        logger.error('signOut event failed to bump session_version', {
          userId: token?.id,
          err: (err as Error)?.message ?? String(err),
        })
      }
    },
  },
})
