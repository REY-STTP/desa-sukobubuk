import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { sanitizeRichText } from '@/lib/sanitize'
import { requireAdmin } from '@/lib/admin-guard'
import { parseBody } from '@/lib/parse-body'
import { profilUpdateSchema } from '@/lib/schemas/profil'
import { CACHE_TAGS } from '@/lib/cache'
import { logAdminAction, getClientIp } from '@/lib/audit'

export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const profil = await prisma.profilDesa.findFirst({
    // P0-3: sertakan relasi agar form inisialisasi dari sumber kanonik,
    // bukan kolom legacy `misi` (yang di-reset "" setiap PUT).
    include: { misi_items: { orderBy: { urutan: 'asc' } } },
  })
  return NextResponse.json(profil)
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const parsed = await parseBody(req, profilUpdateSchema)
  if (parsed instanceof NextResponse) return parsed
  const data = { ...parsed.data }

  try {
    if (typeof data.jumlah_penduduk === 'string') {
      data.jumlah_penduduk = Number(data.jumlah_penduduk)
    }
    if (typeof data.sejarah_konten === 'string' && data.sejarah_konten) {
      data.sejarah_konten = sanitizeRichText(data.sejarah_konten)
    }

    const existing = await prisma.profilDesa.findFirst()
    const profil = existing
      ? await prisma.profilDesa.update({ where: { id: existing.id }, data })
      : await prisma.profilDesa.create({ data })

    // F-303 / DB-006 (Phase 06) — also persist misi_items relation table.
    // The legacy `misi` JSON column is kept as a fallback. New writes
    // populate the relation and reset the JSON column to empty string.
    // P0-3: sinkronisasi relasi berlaku untuk cabang create MAUPUN update
    // (sebelumnya hanya update — profil pertama dibuat tanpa misi).
    const incomingMisi = typeof data.misi === 'string' ? data.misi : ''
    let parsed: string[] = []
    if (incomingMisi.trim().startsWith('[')) {
      try {
        const v = JSON.parse(incomingMisi)
        if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
          parsed = v.filter((s) => s.trim().length > 0)
        }
      } catch {
        parsed = []
      }
    }
    if (parsed.length > 0) {
      await prisma.misiItem.deleteMany({ where: { profil_id: profil.id } })
      await prisma.misiItem.createMany({
        data: parsed.map((text, urutan) => ({ profil_id: profil.id, text, urutan })),
      })
    } else {
      // Mirror empty input to empty rows so the canonical read path is
      // the relation; the legacy JSON column stays for backward read.
      await prisma.misiItem.deleteMany({ where: { profil_id: profil.id } })
    }
    await prisma.profilDesa.update({
      where: { id: profil.id },
      data: { misi: '' },
    })

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: existing ? 'UPDATE' : 'CREATE',
      entity: 'profil',
      entityId: profil.id,
      payload: { nama_desa: data.nama_desa },
      ip: getClientIp(req),
    })

    // P1-C2: invalidasi cache profil agar pembaca bersama
    // (getProfilDesa/getProfilLengkap/getHomeData) segar ≤ detik, bukan 1 jam.
    revalidateTag(CACHE_TAGS.profil, 'max')

    return NextResponse.json(profil)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menyimpan profil desa' }, { status: 500 })
  }
}
