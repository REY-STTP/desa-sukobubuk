import { prisma } from '@/lib/prisma'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  let profil: {
    nama_desa: string | null
    nama_kecamatan: string | null
    nama_kabupaten: string | null
    alamat_kantor: string | null
    telepon: string | null
    email: string | null
  } | null = null

  try {
    profil = await prisma.profilDesa.findFirst({
      select: {
        nama_desa: true,
        nama_kecamatan: true,
        nama_kabupaten: true,
        alamat_kantor: true,
        telepon: true,
        email: true,
      },
    })
  } catch {
    // DB down — pakai fallback default
  }

  return (
    <NavbarClient
      namaDesa={profil?.nama_desa ?? 'Desa Sukobubuk'}
      logoUrl="/images/logo-desa.png"
      namaKecamatan={profil?.nama_kecamatan ?? 'Kec. Margorejo'}
      namaKabupaten={profil?.nama_kabupaten ?? 'Kab. Pati'}
      telepon={profil?.telepon ?? null}
      email={profil?.email ?? null}
      alamat={profil?.alamat_kantor ?? null}
    />
  )
}
