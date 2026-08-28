import { prisma } from '@/lib/prisma'
import HeroClient from './HeroClient'

export const revalidate = 300

export default async function HeroSection() {
  let profil = null
  let totalUMKM = 0
  let totalProduk = 0

  try {
    const results = await Promise.allSettled([
      prisma.profilDesa.findFirst({
        select: {
          nama_desa: true,
          nama_kecamatan: true,
          nama_kabupaten: true,
          nama_provinsi: true,
          kode_pos: true,
          jumlah_penduduk: true,
          tahun_berdiri: true,
        },
      }),
      prisma.uMKM.count(),
      prisma.produk.count(),
    ])

    profil = results[0].status === 'fulfilled' ? results[0].value : null
    totalUMKM = results[1].status === 'fulfilled' ? results[1].value : 0
    totalProduk = results[2].status === 'fulfilled' ? results[2].value : 0
  } catch {
    // DB down — pakai fallback default
  }

  return (
    <HeroClient
      namaDesa={profil?.nama_desa ?? 'Desa Sukobubuk'}
      namaKecamatan={profil?.nama_kecamatan ?? 'Kecamatan Margorejo'}
      namaKabupaten={profil?.nama_kabupaten ?? 'Kabupaten Pati'}
      namaProvinsi={profil?.nama_provinsi ?? 'Jawa Tengah'}
      kodePos={profil?.kode_pos ?? '59163'}
      jumlahPenduduk={profil?.jumlah_penduduk ?? 0}
      tahunBerdiri={profil?.tahun_berdiri?.toString() ?? ''}
      totalUMKM={totalUMKM}
      totalProduk={totalProduk}
    />
  )
}
