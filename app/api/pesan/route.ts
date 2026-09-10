import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { parseBody } from '@/lib/parse-body'
import { pesanCreateSchema } from '@/lib/schemas/pesan'
import { rateLimit, clientKey } from '@/lib/rate-limit'
import { CACHE_TAGS } from '@/lib/cache'

// F-107: API-002 — the public GET was removed (PII leak).
// Admin listing of messages now lives at /api/admin/pesan (see
// `app/api/admin/pesan/route.ts`).
//
// Only POST remains here for the public contact form.

export async function POST(req: NextRequest) {
  // F-103: SEC-008 — limit contact-form submissions to 10 / hour / IP.
  const rl = rateLimit({ key: clientKey(req, 'contact'), limit: 10, windowSec: 3600 })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  const parsed = await parseBody(req, pesanCreateSchema)
  if (parsed instanceof NextResponse) return parsed
  const { nama, email, isi_pesan } = parsed.data

  try {
    const pesan = await prisma.pesan.create({
      data: { nama, email, isi_pesan },
    })

    // F2-FaseP2 / improve — segarkan badge + list pesan admin (15s/10s).
    // Tanpa ini pesan baru tak terlihat admin s/d TTL walau sudah di DB.
    revalidateTag(CACHE_TAGS.pesan, 'max')

    return NextResponse.json({ success: true, data: pesan }, { status: 201 })
  } catch (error) {
    console.error('Error creating pesan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
