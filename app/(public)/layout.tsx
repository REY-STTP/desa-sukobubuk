import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LoadingScreen from '@/components/animations/LoadingScreen'
import { getProfilDesa } from '@/lib/cache'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profil = await getProfilDesa()

  return (
    <>
      <LoadingScreen
        namaDesa={profil?.nama_desa ?? 'Desa Sukobubuk'}
        logoUrl="/images/logo-desa.png"
        namaKecamatan={profil?.nama_kecamatan ?? 'Kec. Margorejo'}
        namaKabupaten={profil?.nama_kabupaten ?? 'Kab. Pati'}
      />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  )
}
