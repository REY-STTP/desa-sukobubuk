import type { Metadata } from 'next'
import { BookOpen, Calendar, ScrollText, Sparkles } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/section'

export const metadata: Metadata = {
  title: 'Sejarah Desa',
  description:
    'Sejarah Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah. Asal-usul desa, timeline sejarah, dan tonggak penting perkembangan Desa Sukobubuk.',
  alternates: { canonical: '/profil/sejarah' },
  openGraph: {
    title: 'Sejarah Desa Sukobubuk',
    description: 'Asal-usul dan timeline sejarah Desa Sukobubuk.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desa-sukobubuk.id'}/profil/sejarah`,
  },
  keywords: ['sejarah Desa Sukobubuk', 'asal-usul desa', 'Kecamatan Margorejo', 'Pati'],
}

interface TimelineItem {
  year: string
  event: string
  highlight?: boolean
}

const TIMELINE_STATIC: TimelineItem[] = [
  { year: '1945', event: 'Partisipasi warga dalam perjuangan kemerdekaan RI' },
  { year: '1970', event: 'Program revolusi hijau meningkatkan produktivitas pertanian' },
  { year: '2000', event: 'Pengembangan sektor kerajinan dan UMKM desa' },
  { year: '2015', event: 'Implementasi program Dana Desa untuk infrastruktur' },
  { year: '2024', event: 'Meraih penghargaan Desa Digital Terbaik Jawa Tengah' },
]

export default async function SejarahPage() {
  const profil = await prisma.profilDesa.findFirst()
  if (!profil) notFound()

  const timeline: TimelineItem[] = [
    {
      year: profil.tahun_berdiri,
      event: `Pendirian ${profil.nama_desa} oleh para leluhur`,
      highlight: true,
    },
    ...TIMELINE_STATIC,
  ]

  return (
    <PageWrapper>
      <PageHeader
        title={`Sejarah ${profil.nama_desa}`}
        breadcrumbs={[
          { label: 'Profil Desa', href: '/profil/sejarah' },
          { label: 'Sejarah' },
        ]}
        variant="editorial"
      />

      {/* Narasi utama */}
      <Section spacing="default" pattern="topo">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Asal-usul (konten) */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-2xl bg-sage-100 text-sage-700 ring-1 ring-inset ring-sage-200">
                <BookOpen className="size-5" />
              </div>
              <h2 className="font-display text-2xl font-medium text-stone-800">
                Asal Usul &amp; Sejarah
              </h2>
            </div>

            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: profil.sejarah_konten }}
            />
          </div>

          {/* Aside info ringkas */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
            <div className="surface-elevated p-6">
              <p className="section-eyebrow text-sage-700 mb-3">
                <Sparkles className="size-3.5" />
                Warisan Desa
              </p>
              <h3 className="font-display text-lg font-medium text-stone-800 mb-2">
                {profil.nama_desa}
              </h3>
              <p className="text-sm leading-relaxed text-stone-600">
                Berdiri sejak tahun{' '}
                <span className="font-semibold text-sage-700">
                  {profil.tahun_berdiri}
                </span>
                , desa kami telah melalui berbagai fase penting dalam sejarah
                Kabupaten Pati.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      {/* Timeline */}
      <Section variant="subtle" spacing="default">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-sage-100 text-sage-700 ring-1 ring-inset ring-sage-200">
              <ScrollText className="size-5" />
            </div>
            <div>
              <p className="section-eyebrow text-sage-700">
                <Calendar className="size-3.5" />
                Tonggak Sejarah
              </p>
              <h2 className="font-display text-2xl font-medium text-stone-800">
                Perjalanan Panjang Desa
              </h2>
            </div>
          </div>

          {/* Desktop: horizontal scroll timeline */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Track horizontal */}
              <div className="absolute left-0 right-0 top-7 h-0.5 bg-stone-200" />

              <ol className="relative grid grid-cols-6 gap-3">
                {timeline.map((item, idx) => (
                  <li
                    key={`${item.year}-${idx}`}
                    className="group relative flex flex-col items-center text-center"
                  >
                    {/* Dot */}
                    <div
                      className={`relative z-10 grid size-14 place-items-center rounded-full ring-4 ring-stone-50 transition-all ${
                        item.highlight
                          ? 'bg-sage-600 text-white shadow-elevated-2'
                          : 'bg-white text-sage-700 ring-stone-50 shadow-elevated-1 group-hover:bg-sage-50'
                      }`}
                    >
                      <span
                        className={`font-mono text-xs font-semibold tabular-nums ${
                          item.highlight ? 'text-white' : 'text-sage-700'
                        }`}
                      >
                        {item.year}
                      </span>
                    </div>

                    {/* Year label below */}
                    <p
                      className={`mt-3 font-mono text-xs tabular-nums ${
                        item.highlight
                          ? 'font-semibold text-sage-700'
                          : 'text-stone-500'
                      }`}
                    >
                      {item.year}
                    </p>

                    {/* Event */}
                    <p
                      className={`mt-1 line-clamp-3 text-xs leading-snug ${
                        item.highlight ? 'text-stone-700' : 'text-stone-600'
                      }`}
                    >
                      {item.event}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Mobile: vertical timeline */}
          <ol className="relative flex flex-col gap-6 md:hidden">
            <div className="absolute bottom-0 left-4 top-0 w-0.5 bg-stone-200" />
            {timeline.map((item, idx) => (
              <li
                key={`${item.year}-${idx}`}
                className="relative flex gap-4 pl-12"
              >
                <div
                  className={`absolute left-2.5 top-1 size-3 rounded-full border-2 border-stone-50 shadow ${
                    item.highlight ? 'bg-sage-600' : 'bg-sage-500'
                  }`}
                />
                <div>
                  <p className="font-mono text-xs font-semibold text-sage-700 tabular-nums">
                    {item.year}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-700">
                    {item.event}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </PageWrapper>
  )
}
