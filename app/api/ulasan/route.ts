import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseData } from '@/lib/parse-body'
import { ulasanCreateSchema } from '@/lib/schemas/ulasan'
import { prismaErrorResponse } from '@/lib/prisma-errors'
import { rateLimit, clientKey } from '@/lib/rate-limit'

// TASK-REV-01 — POST publik ulasan produk. Tiru `app/api/pesan/route.ts`:
// rate-limit 10/jam/IP + `parseBody` + 201. Hanya POST di sini (tidak ada
// GET publik — baca publik lewat `lib/cache.ts` di server component,
// menghindari kebocoran pola seperti kasus PII `pesan` F-107).
//
// Ulasan selalu dibuat pending (`is_approved: false`); tampil + dihitung
// agregat hanya setelah disetujui admin. Honeypot `website` ditolak
// diam-diam sebagai sukses palsu agar bot tak belajar.

export async function POST(req: NextRequest) {
  const rl = rateLimit({ key: clientKey(req, 'ulasan'), limit: 10, windowSec: 3600 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body harus berupa JSON valid' }, { status: 400 })
  }

  // Honeypot: field `website` tidak ada di skema; bot yang mengisinya
  // mendapat sukses palsu tanpa menulis ke DB.
  if (typeof raw === 'object' && raw !== null && 'website' in raw) {
    const hp = (raw as Record<string, unknown>).website
    if (typeof hp === 'string' && hp.trim() !== '') {
      return NextResponse.json({ success: true }, { status: 201 })
    }
  }

  const parsed = parseData(raw, ulasanCreateSchema)
  if (parsed instanceof NextResponse) return parsed
  const { produk_id, nama, rating, komentar } = parsed.data

  try {
    await prisma.ulasan.create({
      data: { produk_id, nama, rating, komentar, is_approved: false },
    })

    // Sengaja TANPA revalidateTag produk: ulasan pending belum tampil
    // publik. Revalidasi terjadi saat admin menyetujui/menghapus.
    // Sengaja tidak kembalikan row (belum tampil; hemat payload).
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    return prismaErrorResponse(error, 'Gagal mengirim ulasan')
  }
}
