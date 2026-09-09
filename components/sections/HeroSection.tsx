import HeroClient from './HeroClient'

// P1-C2: data dioper dari `getHomeData()` via page (satu round-trip).
// Query ganda profil/count di sini dihapus — sebelumnya ~3 query tambahan
// per request homepage yang duplikat dengan `page.tsx`.
type HeroSectionProps = {
  namaDesa: string
  namaKecamatan: string
  namaKabupaten: string
  namaProvinsi: string
  kodePos: string
  jumlahPenduduk: number
  tahunBerdiri: string
  totalUMKM: number
  totalProduk: number
}

export default function HeroSection({
  namaDesa,
  namaKecamatan,
  namaKabupaten,
  namaProvinsi,
  kodePos,
  jumlahPenduduk,
  tahunBerdiri,
  totalUMKM,
  totalProduk,
}: HeroSectionProps) {
  return (
    <HeroClient
      namaDesa={namaDesa}
      namaKecamatan={namaKecamatan}
      namaKabupaten={namaKabupaten}
      namaProvinsi={namaProvinsi}
      kodePos={kodePos}
      jumlahPenduduk={jumlahPenduduk}
      tahunBerdiri={tahunBerdiri}
      totalUMKM={totalUMKM}
      totalProduk={totalProduk}
    />
  )
}
