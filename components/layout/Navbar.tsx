import { getProfilPublik } from '@/lib/cache'
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
    // F2-FaseP2 / T-P20: helper bersama (1 key cache dengan layout/home/
    // footer/CTA) — kolom yang dipakai ada semua di proyeksinya.
    profil = await getProfilPublik()
  } catch {
    // DB down — pakai fallback default
  }

  return (
    <NavbarClient
      namaDesa={profil?.nama_desa ?? 'Desa Sukobubuk'}
      logoUrl="/images/logo-desa.webp"
      namaKecamatan={profil?.nama_kecamatan ?? 'Kec. Margorejo'}
      namaKabupaten={profil?.nama_kabupaten ?? 'Kab. Pati'}
      telepon={profil?.telepon ?? null}
      email={profil?.email ?? null}
      alamat={profil?.alamat_kantor ?? null}
    />
  )
}
