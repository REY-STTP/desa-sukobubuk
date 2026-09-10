import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { parseBody } from '@/lib/parse-body'
import { pejabatUpdateSchema } from '@/lib/schemas/pejabat'
import { deleteUnusedCloudinaryUrl } from '@/lib/cloudinary'
import { CACHE_TAGS } from '@/lib/cache'
import { logAdminAction, getClientIp } from '@/lib/audit'

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const parsed = await parseBody(req, pejabatUpdateSchema)
  if (parsed instanceof NextResponse) return parsed
  const { pejabat } = parsed.data

  try {
    // P2-E2: catat foto lama sebelum replace atomik agar yang tergantikan
    // bisa dibersihkan (best-effort, eksklusif).
    const lama = await prisma.pejabatDesa.findMany({ select: { foto_url: true } })
    // DB-003 (Phase 06) — atomic replace strategy wrapped in a transaction.
    // If the process is killed mid-flight, no partial state is committed.
    const result = await prisma.$transaction(async (tx) => {
      await tx.pejabatDesa.deleteMany()
      return tx.pejabatDesa.createMany({
        data: pejabat.map((p, i) => ({
          jabatan: p.jabatan,
          nama: p.nama,
          kategori: p.kategori,
          urutan: i + 1,
          foto_url: p.foto_url ?? null,
        })),
      })
    })

    // Best-effort: hapus foto yang tak dipakai lagi & eksklusif.
    const baru = new Set(
      pejabat.map((p) => p.foto_url).filter((u): u is string => typeof u === 'string' && u.length > 0)
    )
    for (const row of lama) {
      if (row.foto_url && !baru.has(row.foto_url)) {
        const url: string = row.foto_url
        await deleteUnusedCloudinaryUrl(url, () =>
          prisma.pejabatDesa.findFirst({ where: { foto_url: url } }).then((r) => r !== null)
        )
      }
    }

    await logAdminAction({
      userId: guard.session.user.id,
      userEmail: guard.session.user.email,
      action: 'UPDATE',
      entity: 'pejabat',
      payload: { count: pejabat.length },
      ip: getClientIp(req),
    })

    // F2-FaseP2 / T-P20: halaman struktur-organisasi membaca pejabat via
    // cache tag `profil` — tanpa ini daftar basi s/d TTL (300s).
    revalidateTag(CACHE_TAGS.profil, 'max')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menyimpan pejabat' }, { status: 500 })
  }
}