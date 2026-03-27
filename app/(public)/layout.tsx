import { prisma } from '@/lib/prisma'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PageTransition from '@/components/animations/PageTransition'
import LoadingScreen from '@/components/animations/LoadingScreen'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const profil = await prisma.profilDesa.findFirst({
    select: {
      nama_desa: true,
      nama_kecamatan: true,
      nama_kabupaten: true,
    },
  })

  return (
    <>
      <LoadingScreen
        namaDesa={profil?.nama_desa ?? 'Desa Sukobubuk'}
        logoUrl="/images/logo-desa.png"
        namaKecamatan={profil?.nama_kecamatan ?? 'Kec. Margorejo'}
        namaKabupaten={profil?.nama_kabupaten ?? 'Kab. Pati'}
      />
      <Navbar />
      <PageTransition>
        <main>{children}</main>
      </PageTransition>
      <Footer />
    </>
  )
}