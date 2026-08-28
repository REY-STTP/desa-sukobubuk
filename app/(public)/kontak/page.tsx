import type { Metadata } from 'next'
import KontakForm from './KontakForm'
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/section'
import { contactPageLd, faqLd, breadcrumbLd, ldScript, SITE } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Kontak',
  description:
    'Hubungi Pemerintah Desa Sukobubuk. Alamat Jl. Raya Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah 59163. Telepon, email, WhatsApp, dan jam pelayanan.',
  alternates: { canonical: '/kontak' },
  openGraph: {
    title: 'Kontak Desa Sukobubuk',
    description: 'Alamat, telepon, email, WhatsApp, dan jam pelayanan kantor Desa Sukobubuk.',
    url: `${SITE.url}/kontak`,
  },
  keywords: ['kontak desa Sukobubuk', 'alamat Desa Sukobubuk', 'Kecamatan Margorejo', 'Kabupaten Pati'],
}

export default async function KontakPage() {
  const profil = await prisma.profilDesa.findFirst()

  const infoItems = profil
    ? [
        {
          icon: MapPin,
          title: 'Alamat Kantor',
          content: profil.alamat_kantor,
          mono: false,
        },
        {
          icon: Phone,
          title: 'Telepon',
          content: profil.telepon,
          mono: true,
        },
        {
          icon: Mail,
          title: 'Email',
          content: profil.email,
          mono: true,
        },
        {
          icon: Clock,
          title: 'Jam Pelayanan',
          content: `Senin – Jum'at: ${profil.jam_pelayanan}`,
          mono: false,
        },
      ].filter((i) => i.content)
    : []

  return (
    <PageWrapper>
      <PageHeader
        title="Hubungi Kami"
        subtitle="Sampaikan pertanyaan, kritik, atau masukan Anda untuk kami"
        breadcrumbs={[{ label: 'Kontak' }]}
        variant="gradient"
        pattern="grain"
      />

      <Section spacing="default">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={ldScript(contactPageLd())}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={ldScript(
            breadcrumbLd([{ name: 'Beranda', url: '/' }, { name: 'Kontak', url: '/kontak' }])
          )}
        />

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10">
          {/* Info kontak (2/5) */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <div>
              <h2 className="font-display text-2xl font-medium text-stone-800 mb-2">
                Informasi Kantor
              </h2>
              <p className="text-sm leading-relaxed text-stone-600">
                Kunjungi kantor desa kami pada jam pelayanan, atau hubungi
                lewat WhatsApp dan form di samping.
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {infoItems.map((item) => {
                const Icon = item.icon
                return (
                  <li
                    key={item.title}
                    className="surface-elevated flex items-start gap-4 p-4"
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sage-100 text-sage-700 ring-1 ring-inset ring-sage-200">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-stone-500">
                        {item.title}
                      </p>
                      <p
                        className={`mt-0.5 text-sm text-stone-800 ${
                          item.mono ? 'font-mono tabular-nums break-all' : 'leading-relaxed'
                        }`}
                      >
                        {item.content}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>

            {profil?.whatsapp && (
              <a
                href={`https://wa.me/${profil.whatsapp}?text=Halo%20${encodeURIComponent(
                  profil.nama_desa
                )}%2C%20saya%20ingin%20bertanya.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group surface-elevated flex items-center gap-4 p-4 ring-1 ring-inset ring-sage-200/60 transition-shadow hover:shadow-elevated-3"
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sage-700 text-white shadow-elevated-1">
                  <MessageCircle className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-800">
                    WhatsApp Desa
                  </p>
                  <p className="text-xs text-stone-500">
                    +{profil.whatsapp} — respons dalam jam kerja
                  </p>
                </div>
                <Send className="size-4 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-sage-700" />
              </a>
            )}
          </div>

          {/* Form (3/5) */}
          <div className="lg:col-span-3">
            <KontakForm />
          </div>
        </div>
      </Section>

      {/* FAQ — AEO: membantu AI search engine & featured snippet */}
      <Section spacing="default" variant="subtle" className="border-t border-stone-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={ldScript(
            faqLd([
              {
                q: 'Di mana alamat kantor Desa Sukobubuk?',
                a: 'Kantor Desa Sukobubuk beralamat di Jl. Raya Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah, kode pos 59163.',
              },
              {
                q: 'Kapan jam pelayanan kantor desa?',
                a: `Jam pelayanan kantor Desa Sukobubuk adalah setiap hari kerja Senin sampai Jumat pukul ${profil?.jam_pelayanan ?? '08.00 – 15.00'}.`,
              },
              {
                q: 'Bagaimana cara menghubungi Desa Sukobubuk?',
                a: 'Anda bisa menghubungi melalui formulir kontak di website ini, mengirim email ke admin.desa.sukobubuk@gmail.com, atau melalui WhatsApp resmi desa.',
              },
              {
                q: 'Apakah Desa Sukobubuk memiliki direktori UMKM?',
                a: 'Ya. Desa Sukobubuk memiliki direktori UMKM yang dapat diakses di halaman /umkm pada website ini, lengkap dengan informasi produk dan kontak pemilik.',
              },
            ])
          )}
        />
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 font-display text-2xl font-medium text-stone-800 text-balance">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mb-8 text-sm text-stone-500">
            Jawaban atas pertanyaan umum tentang Desa Sukobubuk.
          </p>
          <dl className="flex flex-col gap-4">
            <div className="surface-elevated p-5">
              <dt className="font-medium text-stone-800">Di mana alamat kantor Desa Sukobubuk?</dt>
              <dd className="mt-2 text-sm leading-relaxed text-stone-600">
                Kantor Desa Sukobubuk beralamat di Jl. Raya Sukobubuk, Kecamatan Margorejo,
                Kabupaten Pati, Jawa Tengah, kode pos 59163.
              </dd>
            </div>
            <div className="surface-elevated p-5">
              <dt className="font-medium text-stone-800">Kapan jam pelayanan kantor desa?</dt>
              <dd className="mt-2 text-sm leading-relaxed text-stone-600">
                Jam pelayanan kantor Desa Sukobubuk adalah setiap hari kerja Senin sampai
                Jumat pukul {profil?.jam_pelayanan ?? '08.00 – 15.00'}.
              </dd>
            </div>
            <div className="surface-elevated p-5">
              <dt className="font-medium text-stone-800">Bagaimana cara menghubungi Desa Sukobubuk?</dt>
              <dd className="mt-2 text-sm leading-relaxed text-stone-600">
                Anda bisa menghubungi melalui formulir kontak di website ini, mengirim email
                ke admin.desa.sukobubuk@gmail.com, atau melalui WhatsApp resmi desa.
              </dd>
            </div>
            <div className="surface-elevated p-5">
              <dt className="font-medium text-stone-800">Apakah Desa Sukobubuk memiliki direktori UMKM?</dt>
              <dd className="mt-2 text-sm leading-relaxed text-stone-600">
                Ya. Desa Sukobubuk memiliki direktori UMKM yang dapat diakses di halaman
                /umkm pada website ini, lengkap dengan informasi produk dan kontak pemilik.
              </dd>
            </div>
          </dl>
        </div>
      </Section>
    </PageWrapper>
  )
}
