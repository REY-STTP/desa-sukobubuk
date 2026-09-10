import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import LoadingScreen from '@/components/animations/LoadingScreen'
import ClientMain from '@/components/layout/ClientMain'
import { LoadingProvider } from '@/lib/loading-context'
import { getProfilPublik } from '@/lib/cache'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // F2-FaseP2 / T-P20: key cache yang sama dengan home/navbar/footer/CTA.
  const profil = await getProfilPublik()

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
