import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sanitizeRichText } from '@/lib/sanitize'
import { requireAdmin } from '@/lib/admin-guard'

export async function GET() {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  const profil = await prisma.profilDesa.findFirst()
  return NextResponse.json(profil)
}

export async function PUT(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error

  try {
    const body = await req.json()
    const {
      nama_desa, nama_kecamatan, nama_kabupaten, nama_provinsi, kode_pos,
      jumlah_penduduk, tahun_berdiri, alamat_kantor, telepon, email, whatsapp,
      jam_pelayanan, maps_embed_url, maps_link,
      sejarah_konten, visi, misi, periode_visi_misi,
    } = body

    const existing = await prisma.profilDesa.findFirst()
    const data = {
      nama_desa, nama_kecamatan, nama_kabupaten, nama_provinsi, kode_pos,
      jumlah_penduduk: Number(jumlah_penduduk),
      tahun_berdiri, alamat_kantor, telepon, email, whatsapp,
      jam_pelayanan, maps_embed_url, maps_link,
      // Defense-in-depth: sanitize sejarah_konten on save
      sejarah_konten: sanitizeRichText(sejarah_konten),
      visi, misi, periode_visi_misi,
    }

    const profil = existing
      ? await prisma.profilDesa.update({ where: { id: existing.id }, data })
      : await prisma.profilDesa.create({ data })

    return NextResponse.json(profil)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menyimpan profil desa' }, { status: 500 })
  }
}
