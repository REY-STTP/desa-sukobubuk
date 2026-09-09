import type { Metadata } from 'next'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/section'
import { breadcrumbLd, ldScript } from '@/lib/structured-data'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.desa-sukobubuk.web.id'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Kebijakan privasi website resmi Desa Sukobubuk: data yang dikumpulkan, tujuan penggunaan, dan hak Anda.',
  alternates: {
    canonical: '/kebijakan-privasi',
    languages: { 'id-ID': `${SITE}/kebijakan-privasi` },
  },
}

const SECTIONS: Array<{ h: string; p: string[] }> = [
  {
    h: 'Data yang kami kumpulkan',
    p: [
      'Formulir kontak: nama, email, dan isi pesan yang Anda kirimkan. Data ini dipakai semata-mata untuk menindaklanjuti pesan Anda.',
      'Data teknis agregat (mis. halaman dikunjungi) untuk statistik internal tanpa mengidentifikasi individu.',
    ],
  },
  {
    h: 'Tujuan penggunaan',
    p: [
      'Menjawab pertanyaan, kritik, dan masukan warga melalui formulir kontak.',
      'Meningkatkan kualitas layanan informasi desa. Kami tidak menjual atau membagikan data Anda ke pihak ketiga untuk pemasaran.',
    ],
  },
  {
    h: 'Penyimpanan & keamanan',
    p: [
      'Pesan tersimpan di basis data internal dan hanya dapat diakses administrator desa yang berwenang.',
      'Akses panel admin dilindungi autentikasi, pembatasan laju login, dan pencatatan audit.',
    ],
  },
  {
    h: 'Hak Anda',
    p: [
      'Anda dapat meminta salinan, koreksi, atau penghapusan pesan Anda dengan menghubungi kantor desa melalui halaman Kontak.',
    ],
  },
]

export default function KebijakanPrivasiPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Kebijakan Privasi"
        subtitle="Bagaimana kami mengumpulkan, memakai, dan melindungi data Anda"
        breadcrumbs={[{ label: 'Kebijakan Privasi' }]}
      />
      <Section spacing="default">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={ldScript(
            breadcrumbLd([
              { name: 'Beranda', url: '/' },
              { name: 'Kebijakan Privasi', url: '/kebijakan-privasi' },
            ])
          )}
        />
        <div className="container-prose">
          <div className="prose-content">
            <p>
              Website resmi Pemerintah Desa Sukobubuk, Kecamatan Margorejo,
              Kabupaten Pati. Terakhir diperbarui:{' '}
              <time dateTime="2026-09-09">9 September 2026</time>.
            </p>
            {SECTIONS.map((s) => (
              <section key={s.h}>
                <h2>{s.h}</h2>
                {s.p.map((t, i) => (
                  <p key={i}>{t}</p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </Section>
    </PageWrapper>
  )
}
