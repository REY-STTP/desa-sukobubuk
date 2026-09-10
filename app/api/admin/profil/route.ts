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

    // F2-Fase3 / T-33: kolom legacy `misi` langsung ditulis "" di tulis
    // utama (update kedua khusus reset dihapus — end-state identik).
    // `data` adalah objek yang sama dengan yang sudah disanitasi di atas.
    data.misi = ''

    // F-303 / DB-006 (Phase 06) — also persist misi_items relation table.
    // The legacy `misi` JSON column is kept as a fallback. New writes
    // populate the relation and reset the JSON column to empty string.
    // P0-3: sinkronisasi relasi berlaku untuk cabang create MAUPUN update
    // (sebelumnya hanya update — profil pertama dibuat tanpa misi).
    const incomingMisi = typeof parsed.data.misi === 'string' ? parsed.data.misi : ''
    let parsedMisi: string[] = []
    if (incomingMisi.trim().startsWith('[')) {
      try {
        const v = JSON.parse(incomingMisi)
        if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
          parsedMisi = v.filter((s) => s.trim().length > 0)
        }
      } catch {
        parsedMisi = []
      }
    }
    // F2-Fase3 / T-33: tulis profil + relasi atomik. Tanpa ini kegagalan
    // di tengah (mis. createMany) menyisakan profil tanpa misi.
    // `logAdminAction` + `revalidateTag` tetap di luar transaksi (di bawah)
    // agar tak menahan koneksi pooler.
    const profil = await prisma.$transaction(async (tx) => {
      const row = existing
        ? await tx.profilDesa.update({ where: { id: existing.id }, data })
        : await tx.profilDesa.create({ data })
      await tx.misiItem.deleteMany({ where: { profil_id: row.id } })
      if (parsedMisi.length > 0) {
        await tx.misiItem.createMany({
          data: parsedMisi.map((text, urutan) => ({ profil_id: row.id, text, urutan })),
        })
      }
      return row
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
