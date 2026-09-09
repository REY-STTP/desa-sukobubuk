import type { Metadata } from 'next'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/section'
import { breadcrumbLd, ldScript } from '@/lib/structured-data'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.desa-sukobubuk.web.id'

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description:
    'Syarat dan ketentuan penggunaan website resmi Desa Sukobubuk: penggunaan wajar, konten, dan batasan tanggung jawab.',
  alternates: {
    canonical: '/syarat-ketentuan',
    languages: { 'id-ID': `${SITE}/syarat-ketentuan` },
  },
}

const SECTIONS: Array<{ h: string; p: string[] }> = [
  {
    h: 'Penggunaan wajar',
    p: [
      'Gunakan website ini untuk keperluan informasi, layanan, dan partisipasi yang sah. Dilarang mengirim spam, konten SARA, ujaran kebencian, atau muatan berbahaya melalui formulir kontak.',
      'Upaya akses tanpa hak ke panel admin, pengujian keamanan tanpa izin, atau serangan penolakan layanan dapat ditindaklanjuti sesuai hukum yang berlaku.',
    ],
  },
  {
    h: 'Konten',
    p: [
      'Berita, profil, data UMKM, dan galeri diterbitkan oleh Pemerintah Desa Sukobubuk untuk transparansi informasi publik.',
      'Foto/logo UMKM ditampilkan atas persetujuan pemilik usaha. Pemilik dapat meminta koreksi atau penayangan ulang melalui halaman Kontak.',
    ],
  },
  {
    h: 'Tautan pihak ketiga',
    p: [
      'Tautan keluar (mis. Google Maps, media sosial) mengarah ke layanan pihak ketiga dengan kebijakan masing-masing. Kami tidak bertanggung jawab atas konten dan praktik privasi situs tersebut.',
    ],
  },
  {
    h: 'Batasan tanggung jawab',
    p: [
      'Informasi disajikan sebaik-baiknya dan dapat berubah tanpa pemberitahuan. Untuk keperluan administratif resmi, konfirmasikan langsung ke kantor desa pada jam pelayanan.',
    ],
  },
]

export default function SyaratKetentuanPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Syarat & Ketentuan"
        subtitle="Aturan penggunaan website resmi Desa Sukobubuk"
        breadcrumbs={[{ label: 'Syarat & Ketentuan' }]}
      />
      <Section spacing="default">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={ldScript(
            breadcrumbLd([
              { name: 'Beranda', url: '/' },
              { name: 'Syarat & Ketentuan', url: '/syarat-ketentuan' },
            ])
          )}
        />
        <div className="container-prose">
          <div className="prose-content">
            <p>
              Dengan mengakses website ini, Anda menyetujui ketentuan di bawah
              ini. Terakhir diperbarui:{' '}
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
