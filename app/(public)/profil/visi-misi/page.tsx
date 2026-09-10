import type { Metadata } from 'next'
import { Eye, Target, CheckCircle, Quote } from 'lucide-react'
import { getProfilLengkap, getMisiItems } from '@/lib/cache'
import { notFound } from 'next/navigation'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/section'
import { faqLd, ldScript } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Visi & Misi',
  description:
    'Visi dan Misi Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah. Komitmen Pemerintah Desa untuk melayani warga.',
  alternates: { canonical: '/profil/visi-misi' },
  openGraph: {
    title: 'Visi & Misi Desa Sukobubuk',
    description: 'Arah dan komitmen Pemerintah Desa Sukobubuk.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.desa-sukobubuk.web.id'}/profil/visi-misi`,
  },
  keywords: ['visi misi Desa Sukobubuk', 'Komitmen desa', 'Margorejo'],
}

export default async function VisiMisiPage() {
  // P1-C2: baca dari cache bersama (tag profil, revalidate 1 jam).
  const profil = await getProfilLengkap()
  if (!profil) notFound()

  // F-303 / DB-006 (Phase 06) — canonical source is the misi_items
  // relation table. Fall back to parsing the legacy JSON column
  // when no items have been written to the table yet.
  // F2-FaseP2 / T-P20: relasi via helper ter-cache (sebelumnya findMany
  // langsung tiap render; butuh profil.id dulu sehingga tetap sekuensial).
  const misiRows = await getMisiItems(profil.id)
  let misi: string[] = misiRows.map((r) => r.text)
  if (misi.length === 0) {
    try {
      misi = JSON.parse(profil.misi)
    } catch {
      misi = []
    }
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

      {/* SEO-005 / F-219 — FAQ block + JSON-LD */}
      <Section variant="subtle" spacing="default">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 font-display text-2xl font-medium text-stone-800 text-balance">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="mb-8 text-sm text-stone-500">
            Jawaban atas pertanyaan umum tentang visi dan misi Desa Sukobubuk.
          </p>
          <dl className="flex flex-col gap-4">
            <div className="surface-elevated p-5">
              <dt className="faq-q font-medium text-stone-800">Apa visi Desa Sukobubuk?</dt>
              <dd className="faq-a mt-2 text-sm leading-relaxed text-stone-600">
                {profil.visi}
              </dd>
            </div>
            <div className="surface-elevated p-5">
              <dt className="faq-q font-medium text-stone-800">Berapa periode visi & misi saat ini?</dt>
              <dd className="faq-a mt-2 text-sm leading-relaxed text-stone-600">
                Periode {profil.periode_visi_misi}.
              </dd>
            </div>
            <div className="surface-elevated p-5">
              <dt className="faq-q font-medium text-stone-800">Bagaimana cara menyampaikan aspirasi untuk desa?</dt>
              <dd className="faq-a mt-2 text-sm leading-relaxed text-stone-600">
                Gunakan formulir kontak di /kontak atau datang langsung ke kantor desa pada jam pelayanan.
              </dd>
            </div>
          </dl>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={ldScript(
              faqLd(
                [
                  {
                    q: 'Apa visi Desa Sukobubuk?',
                    a: profil.visi,
                  },
                  {
                    q: 'Berapa periode visi & misi saat ini?',
                    a: `Periode ${profil.periode_visi_misi}.`,
                  },
                  {
                    q: 'Bagaimana cara menyampaikan aspirasi untuk desa?',
                    a: 'Gunakan formulir kontak di /kontak atau datang langsung ke kantor desa pada jam pelayanan.',
                  },
                ],
                {
                  speakableXpath: [
                    '/html/body//dt[contains(@class,"faq-q")]',
                    '/html/body//dd[contains(@class,"faq-a")]',
                  ],
                }
              )
            )}
          />
        </div>
      </Section>
    </PageWrapper>
  )
}
