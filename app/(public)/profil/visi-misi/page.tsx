import type { Metadata } from 'next'
import { Eye, Target, CheckCircle, Quote } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/section'

export const metadata: Metadata = {
  title: 'Visi & Misi',
  description:
    'Visi dan Misi Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah. Komitmen Pemerintah Desa untuk melayani warga.',
  alternates: { canonical: '/profil/visi-misi' },
  openGraph: {
    title: 'Visi & Misi Desa Sukobubuk',
    description: 'Arah dan komitmen Pemerintah Desa Sukobubuk.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desa-sukobubuk.id'}/profil/visi-misi`,
  },
  keywords: ['visi misi Desa Sukobubuk', 'Komitmen desa', 'Margorejo'],
}

export default async function VisiMisiPage() {
  const profil = await prisma.profilDesa.findFirst()
  if (!profil) notFound()

  let misi: string[] = []
  try {
    misi = JSON.parse(profil.misi)
  } catch {
    misi = []
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Visi & Misi"
        subtitle={`Arah dan komitmen ${profil.nama_desa} Periode ${profil.periode_visi_misi}`}
        breadcrumbs={[
          { label: 'Profil Desa', href: '/profil/visi-misi' },
          { label: 'Visi & Misi' },
        ]}
        variant="editorial"
      />

      {/* VISI — editorial blockquote centered */}
      <Section
        variant="subtle"
        spacing="loose"
        pattern="topo"
        size="narrow"
        className="text-center"
      >
        <div className="mb-6 inline-flex items-center gap-2 text-sage-700 font-semibold text-xs uppercase tracking-[0.14em]">
          <Eye className="size-4" />
          Visi
        </div>

        <Quote
          aria-hidden
          className="mx-auto mb-6 size-12 text-sage-300/70"
        />

        <blockquote className="font-display text-2xl font-medium italic leading-snug text-stone-800 text-balance md:text-3xl lg:text-4xl">
          &ldquo;{profil.visi}&rdquo;
        </blockquote>

        <p className="mt-6 text-sm text-stone-500">
          — Visi Pemerintah {profil.nama_desa} Periode{' '}
          {profil.periode_visi_misi}
        </p>
      </Section>

      {/* MISI — numbered grid 2-col */}
      <Section spacing="default">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 text-sage-700 font-semibold text-xs uppercase tracking-[0.14em]">
              <Target className="size-4" />
              Misi
            </div>
            <h2 className="font-display text-3xl font-medium text-stone-800 md:text-4xl text-balance">
              Komitmen Konkrit Kami
            </h2>
            <p className="mt-3 text-stone-600 max-w-2xl mx-auto">
              Langkah-langkah strategis yang kami tempuh untuk mewujudkan visi
              desa.
            </p>
          </div>

          {misi.length === 0 ? (
            <p className="text-center text-stone-500 py-8">
              Misi belum ditambahkan.
            </p>
          ) : (
            <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {misi.map((item, index) => (
                <li
                  key={index}
                  className="group surface-elevated flex gap-4 p-5 transition-shadow hover:shadow-elevated-3"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-sage-100 text-sage-700 ring-1 ring-inset ring-sage-200 font-mono font-semibold tabular-nums text-sm">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="flex flex-1 items-start gap-3 min-w-0">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-sage-600" />
                    <p className="text-sm leading-relaxed text-stone-700">
                      {item}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Section>
    </PageWrapper>
  )
}
