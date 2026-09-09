import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LoadingScreen from '@/components/animations/LoadingScreen'
import ClientMain from '@/components/layout/ClientMain'
import { LoadingProvider } from '@/lib/loading-context'
import { getProfilDesa } from '@/lib/cache'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profil = await getProfilDesa()

  return (
    <LoadingProvider>
      <LoadingScreen
        namaDesa={profil?.nama_desa ?? 'Desa Sukobubuk'}
        logoUrl="/images/logo-desa.webp"
        namaKecamatan={profil?.nama_kecamatan ?? 'Kec. Margorejo'}
        namaKabupaten={profil?.nama_kabupaten ?? 'Kab. Pati'}
      />
      <Navbar />
      <ClientMain>{children}</ClientMain>
      <Footer />
    </LoadingProvider>
  )
}
