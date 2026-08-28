import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
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

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
    datasources: {
      db: {
        url: withTimeout(process.env.DATABASE_URL),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
