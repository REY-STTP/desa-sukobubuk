import type { Metadata } from 'next'
import Image from 'next/image'
import { Users, Mail, Building2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getProfilLengkap } from '@/lib/cache'
import { shouldSkipImageOptimization } from '@/lib/image-optim'
import { notFound } from 'next/navigation'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/section'
import { faqLd, ldScript } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Struktur Organisasi',
  description:
    'Struktur organisasi dan pejabat Pemerintah Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah: Kepala Desa, Sekretaris, Kasi, Kaur, dan Kepala Dusun.',
  alternates: { canonical: '/profil/struktur-organisasi' },
  openGraph: {
    title: 'Struktur Organisasi Desa Sukobubuk',
    description: 'Pejabat dan perangkat Desa Sukobubuk.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.desa-sukobubuk.web.id'}/profil/struktur-organisasi`,
  },
  keywords: ['struktur organisasi Desa Sukobubuk', 'kepala desa Sukobubuk', 'perangkat desa'],
}

interface Pejabat {
  id: number
  jabatan: string
  nama: string
  kategori: string
  urutan: number
  foto_url?: string | null
}

interface OrgCardProps {
  pejabat: Pejabat
  highlight?: boolean
  size?: 'sm' | 'md' | 'lg'
}

function OrgCard({ pejabat, highlight = false, size = 'md' }: OrgCardProps) {
  const sizeClass = {
    sm: { wrap: 'w-44', photo: 'size-14', name: 'text-sm', jabatan: 'text-xs' },
    md: { wrap: 'w-56', photo: 'size-16', name: 'text-sm', jabatan: 'text-xs' },
    lg: { wrap: 'w-64', photo: 'size-20', name: 'text-base', jabatan: 'text-sm' },
  }[size]

  return (
    <div
      className={`${sizeClass.wrap} rounded-2xl p-4 text-center ring-1 transition-all ${
        highlight
          ? 'bg-sage-700 text-white ring-sage-700 shadow-elevated-3'
          : 'bg-white text-stone-800 ring-stone-200 shadow-elevated-1 hover:shadow-elevated-3 hover:ring-sage-300'
      }`}
    >
      <div
        className={`${sizeClass.photo} mx-auto mb-3 grid place-items-center overflow-hidden rounded-full ring-4 ${
          highlight
            ? 'bg-white/10 ring-white/20'
            : 'bg-sage-100 ring-sage-50'
        }`}
      >
        {pejabat.foto_url ? (
          <Image
            src={pejabat.foto_url}
            alt={pejabat.nama}
            width={80}
            height={80}
            className="size-full object-cover"
            unoptimized={shouldSkipImageOptimization(pejabat.foto_url)}
          />
        ) : (
          <Users
            className={`size-1/2 ${
              highlight ? 'text-white' : 'text-sage-600'
            }`}
          />
        )}
      </div>
      <p className={`font-semibold leading-tight ${sizeClass.name}`}>
        {pejabat.nama}
      </p>
      <p
        className={`mt-1 leading-tight ${
          highlight ? 'text-sage-100' : 'text-stone-500'
        } ${sizeClass.jabatan}`}
      >
        {pejabat.jabatan}
      </p>
    </div>
  )
}

/** Connector line: vertical stub dari card ke track */
function Connector({ height = 24 }: { height?: number }) {
  return (
    <div
      aria-hidden
      className="mx-auto w-px bg-stone-300"
      style={{ height: `${height}px` }}
    />
  )
}

/** Horizontal track dengan cabang ke multiple children */
function BranchTrack({ count }: { count: number }) {
  if (count <= 1) return null
  return (
    <div
      aria-hidden
      className="relative mx-auto"
      style={{ width: `${Math.min(count, 6) * 14}rem`, maxWidth: '100%' }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-stone-300" />
      <div
        className="absolute top-0 h-3 w-px bg-stone-300"
        style={{ left: `${100 / (count * 2)}%` }}
      />
      <div
        className="absolute top-0 h-3 w-px bg-stone-300"
        style={{ left: `${100 - 100 / (count * 2)}%` }}
      />
    </div>
  )
}

export default async function StrukturOrganisasiPage() {
  const [profil, pejabat] = await Promise.all([
    // P1-C2: baca dari cache bersama (tag profil, revalidate 1 jam).
    getProfilLengkap(),
    prisma.pejabatDesa.findMany({
      orderBy: [{ kategori: 'asc' }, { urutan: 'asc' }],
    }),
  ])
  if (!profil) notFound()

  const kepala = pejabat.find((p) => p.kategori === 'kepala')
  const sek = pejabat.find((p) => p.kategori === 'sekretaris')
  const kasi = pejabat.filter((p) => p.kategori === 'kasi')
  const kaur = pejabat.filter((p) => p.kategori === 'kaur')
  const kadus = pejabat.filter((p) => p.kategori === 'kadus')

  return (
    <PageWrapper>
      <PageHeader
        title="Struktur Organisasi"
        subtitle={`Pemerintah ${profil.nama_desa} Periode ${profil.periode_visi_misi}`}
        breadcrumbs={[
          { label: 'Profil Desa', href: '/profil/struktur-organisasi' },
          { label: 'Struktur Organisasi' },
        ]}
        variant="editorial"
      />

      <Section spacing="default">
        <div className="mx-auto max-w-5xl">
          {kepala && (
            <div className="flex justify-center">
              <OrgCard pejabat={kepala} highlight size="lg" />
            </div>
          )}

          {kepala && sek && (
            <>
              <Connector height={32} />
              <div className="flex justify-center">
                <OrgCard pejabat={sek} size="md" />
              </div>
            </>
          )}

          {kasi.length > 0 && (
            <>
              <Connector height={32} />
              <div className="mb-4 text-center">
                <h2 className="section-eyebrow text-stone-500">Kepala Seksi</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {kasi.map((p) => (
                  <OrgCard key={p.id} pejabat={p} size="sm" />
                ))}
              </div>
            </>
          )}

          {kaur.length > 0 && (
            <>
              <Connector height={32} />
              <div className="mb-4 text-center">
                <h2 className="section-eyebrow text-stone-500">Kepala Urusan</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {kaur.map((p) => (
                  <OrgCard key={p.id} pejabat={p} size="sm" />
                ))}
              </div>
            </>
          )}

          {kadus.length > 0 && (
            <>
              <Connector height={32} />
              <div className="mb-4 text-center">
                <h2 className="section-eyebrow text-stone-500">Kepala Dusun</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {kadus.map((p) => (
                  <OrgCard key={p.id} pejabat={p} size="sm" />
                ))}
              </div>
            </>
          )}

          {pejabat.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto mb-3 size-12 text-stone-300" />
              <p className="text-stone-500">Data struktur organisasi belum tersedia.</p>
            </div>
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
            Jawaban atas pertanyaan umum tentang struktur organisasi Desa Sukobubuk.
          </p>
          <dl className="flex flex-col gap-4">
            <div className="surface-elevated p-5">
              <dt className="faq-q font-medium text-stone-800">Siapa Kepala Desa saat ini?</dt>
              <dd className="faq-a mt-2 text-sm leading-relaxed text-stone-600">
                Kepala Desa tercantum di halaman ini (/profil/struktur-organisasi) sebagai Pejabat dengan kategori kepala.
              </dd>
            </div>
            <div className="surface-elevated p-5">
              <dt className="faq-q font-medium text-stone-800">Bagaimana cara menghubungi perangkat desa?</dt>
              <dd className="faq-a mt-2 text-sm leading-relaxed text-stone-600">
                Datang ke kantor desa pada jam pelayanan (lihat /kontak) atau gunakan formulir kontak.
              </dd>
            </div>
            <div className="surface-elevated p-5">
              <dt className="faq-q font-medium text-stone-800">Apakah struktur organisasi berubah setiap periode?</dt>
              <dd className="faq-a mt-2 text-sm leading-relaxed text-stone-600">
                Ya, struktur organisasi dapat berubah sesuai periode kepemimpinan dan regulasi yang berlaku.
              </dd>
            </div>
          </dl>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={ldScript(
              faqLd(
                [
                  {
                    q: 'Siapa Kepala Desa saat ini?',
                    a: 'Kepala Desa tercantum di halaman ini (/profil/struktur-organisasi) sebagai Pejabat dengan kategori kepala.',
                  },
                  {
                    q: 'Bagaimana cara menghubungi perangkat desa?',
                    a: 'Datang ke kantor desa pada jam pelayanan (lihat /kontak) atau gunakan formulir kontak.',
                  },
                  {
                    q: 'Apakah struktur organisasi berubah setiap periode?',
                    a: 'Ya, struktur organisasi dapat berubah sesuai periode kepemimpinan dan regulasi yang berlaku.',
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
