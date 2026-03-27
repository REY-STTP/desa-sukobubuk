import type { Metadata } from 'next'
import { BookOpen, MapPin } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PageWrapper from '@/components/animations/PageWrapper'

export const metadata: Metadata = { title: 'Sejarah Desa' }

const TIMELINE_STATIC = [
  { year: '1945', event: 'Partisipasi warga dalam perjuangan kemerdekaan RI' },
  { year: '1970', event: 'Program revolusi hijau meningkatkan produktivitas pertanian' },
  { year: '2000', event: 'Pengembangan sektor kerajinan dan UMKM desa' },
  { year: '2015', event: 'Implementasi program Dana Desa untuk infrastruktur' },
  { year: '2024', event: 'Meraih penghargaan Desa Digital Terbaik Jawa Tengah' },
]

export default async function SejarahPage() {
  const profil = await prisma.profilDesa.findFirst()
  if (!profil) notFound()

  const timeline = [
    { year: profil.tahun_berdiri, event: `Pendirian ${profil.nama_desa} oleh para leluhur` },
    ...TIMELINE_STATIC,
  ]

  return (
    <PageWrapper>
      <div className="pt-24">
        <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-16">
          <div className="container-custom">
            <div className="flex items-center gap-2 text-primary-300 text-sm mb-3">
              <MapPin className="w-4 h-4" />
              Profil Desa / Sejarah
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Sejarah {profil.nama_desa}</h1>
          </div>
        </div>

        <div className="container-custom py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900">Asal Usul dan Sejarah</h2>
            </div>

            <div
              className="prose-content space-y-6 text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: profil.sejarah_konten }}
            />

            {/* Timeline */}
            <div className="mt-12">
              <h3 className="font-display text-xl font-bold text-gray-900 mb-6">Tonggak Sejarah</h3>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary-200" />
                {timeline.map((item) => (
                  <div key={item.year} className="relative pl-12 pb-8">
                    <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary-600 border-2 border-white shadow" />
                    <p className="text-xs font-bold text-primary-600 mb-1">{item.year}</p>
                    <p className="text-gray-700">{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}