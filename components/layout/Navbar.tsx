import { prisma } from '@/lib/prisma'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const profil = await prisma.profilDesa.findFirst({
    select: { nama_desa: true, nama_kecamatan: true, nama_kabupaten: true },
  })

  return (
    <NavbarClient
      namaDesa={profil?.nama_desa ?? 'Desa Sukobubuk'}
      logoUrl="/images/logo-desa.png"
      namaKecamatan={profil?.nama_kecamatan ?? 'Kec. Margorejo'}
      namaKabupaten={profil?.nama_kabupaten ?? 'Kab. Pati'}
    />
  )
}