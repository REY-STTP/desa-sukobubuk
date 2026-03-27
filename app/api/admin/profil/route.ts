import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const profil = await prisma.profilDesa.findFirst()
  return NextResponse.json(profil)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
      sejarah_konten, visi, misi, periode_visi_misi,
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
