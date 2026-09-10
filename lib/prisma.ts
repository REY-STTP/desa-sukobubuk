import { PrismaClient } from '@prisma/client'

/**
 * F2-Fase5 / T-50 — timing observabilitas: dievaluasi `$extends`, DITOLAK.
 * `$extends({ query: { $allOperations } })` terbukti jalan di plain node
 * namun hook-nya TIDAK PERNAH dieksekusi di runtime Turbopack dev (bahkan
 * dengan body tanpa syarat — diverifikasi via probe 2026-09-11), sehingga
 * timing dipindah ke call-site via `timed()` di `lib/cache.ts` (VERIFIED).
 */
function createClient() {
  return new PrismaClient({
    // Log query mentah hanya bila eksplisit (default bersih).
    log: process.env.DEBUG_PRISMA === '1' ? ['query'] : ['error'],
    datasources: {
      db: {
        url: withTimeout(process.env.DATABASE_URL),
      },
    },
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined
}

/**
 * Inject connection timeouts ke DATABASE_URL secara idempotent.
 *
 * Latency Vercel serverless region (sin1/hnd1/fra1) → Supabase pooler
 * (aws-1-ap-southeast-2:6543) sering ~150-300ms, dan first-connect bisa timeout
 * tanpa batas — menyebabkan Prisma P1001 di background revalidation.
 *
 * `connect_timeout` & `pool_timeout` adalah parameter resmi libpq / PgBouncer.
 * Hanya ditambah jika belum ada, agar tidak override setting eksplisit user.
 */
function withTimeout(url: string | undefined): string | undefined {
  if (!url) return url
  try {
    const u = new URL(url)
    if (!u.searchParams.has('connect_timeout')) u.searchParams.set('connect_timeout', '10')
    if (!u.searchParams.has('pool_timeout')) u.searchParams.set('pool_timeout', '10')
    return u.toString()
  } catch {
    // URL invalid — biarkan apa adanya, biar Prisma yang fail loud
    return url
  }
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
