import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Newspaper, Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate, stripHtml, truncate } from '@/lib/utils'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { Section, SectionHeader } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { getBeritaPublik, PUBLIC_PAGE_SIZE } from '@/lib/cache'

export const metadata: Metadata = {
  title: 'Berita & Pengumuman',
  description:
    'Berita terkini dan pengumuman resmi dari Pemerintah Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah. Informasi kegiatan desa, program, dan pengumuman penting untuk warga.',
  alternates: { canonical: '/berita' },
  openGraph: {
    title: 'Berita & Pengumuman Desa Sukobubuk',
    description: 'Kumpulan berita dan pengumuman resmi Desa Sukobubuk.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desa-sukobubuk.id'}/berita`,
  },
  keywords: ['berita Desa Sukobubuk', 'pengumuman desa', 'Kecamatan Margorejo', 'Pati'],
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function BeritaPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)

  const { data: berita, total, totalPages } = await getBeritaPublik(page)

  if (page > totalPages && totalPages > 0) notFound()

  const buildHref = (p: number) => (p === 1 ? '/berita' : `/berita?page=${p}`)

  const [featured, ...rest] = berita

  return (
    <PageWrapper>
      <PageHeader
        title="Berita & Pengumuman"
        subtitle="Informasi dan pengumuman resmi Desa Sukobubuk"
        breadcrumbs={[{ label: 'Berita' }]}
        variant="editorial"
      />

      <Section spacing="default">
        {berita.length === 0 ? (
          <EmptyState
            icon={<Newspaper className="size-6" />}
            title="Belum ada berita"
            description="Berita akan muncul di sini setelah dipublikasikan oleh admin desa."
          />
        ) : (
          <>
            {/* Bento: featured + grid */}
            {featured && (
              <div className="mb-8 grid grid-cols-1 gap-5 md:mb-12 md:grid-cols-3 md:gap-6">
                {/* Featured — 2/3 */}
                <Link
                  href={`/berita/${featured.slug}`}
                  className="group block md:col-span-2"
                >
                  <article className="surface-elevated flex h-full flex-col overflow-hidden rounded-3xl">
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-sage-200 to-stone-200">
                      {featured.thumbnail ? (
                        <Image
                          src={featured.thumbnail}
                          alt={featured.judul}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="grid size-full place-items-center">
                          <Newspaper className="size-20 text-stone-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
                      <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {formatDate(featured.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <User className="size-3.5" />
                          {featured.author.name}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-medium leading-tight text-stone-800 group-hover:text-sage-700 transition-colors text-balance md:text-3xl">
                        {featured.judul}
                      </h3>
                      <p className="line-clamp-3 text-sm leading-relaxed text-stone-600 md:text-base">
                        {truncate(stripHtml(featured.konten), 180)}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-sage-700 transition-all group-hover:gap-2.5">
                        Baca selengkapnya
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </article>
                </Link>

                {/* Sidebar recent — 1/3 */}
                <aside className="flex flex-col gap-3">
                  <p className="section-eyebrow text-stone-500 mb-2">
                    Terbaru
                  </p>
                  {rest.slice(0, 4).map((item) => (
                    <Link
                      key={item.id}
                      href={`/berita/${item.slug}`}
                      className="group flex gap-3 rounded-2xl p-3 transition-colors hover:bg-white hover:shadow-elevated-2"
                    >
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-sage-100 to-stone-100">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.judul}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="grid size-full place-items-center">
                            <Newspaper className="size-5 text-stone-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-stone-800 group-hover:text-sage-700 transition-colors">
                          {item.judul}
                        </p>
                        <p className="mt-1 text-xs text-stone-500 inline-flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </aside>
              </div>
            )}

            {/* Grid of remaining */}
            {rest.length > 4 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {rest.slice(4).map((item) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.slug}`}
                    className="group block"
                  >
                    <article className="surface-elevated flex h-full flex-col overflow-hidden rounded-2xl">
                      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-sage-100 to-stone-100">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.judul}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            unoptimized
                          />
                        ) : (
                          <div className="grid size-full place-items-center">
                            <Newspaper className="size-10 text-stone-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-2 flex items-center gap-3 text-xs text-stone-500">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="size-3" />
                            {formatDate(item.created_at)}
                          </span>
                          <span className="inline-flex items-center gap-1 truncate">
                            <User className="size-3" />
                            {item.author.name}
                          </span>
                        </div>
                        <h3 className="font-display text-base font-medium leading-snug text-stone-800 group-hover:text-sage-700 transition-colors line-clamp-2">
                          {item.judul}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                          {truncate(stripHtml(item.konten), 110)}
                        </p>
                        <span className="mt-auto inline-flex items-center gap-1 pt-3 text-xs font-medium text-sage-700 transition-all group-hover:gap-1.5">
                          Baca
                          <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-6 sm:flex-row">
                <p className="text-sm text-stone-500">
                  Menampilkan{' '}
                  <span className="font-semibold text-stone-800">
                    {(page - 1) * PUBLIC_PAGE_SIZE + 1}–
                    {Math.min(page * PUBLIC_PAGE_SIZE, total)}
                  </span>{' '}
                  dari <span className="font-semibold text-stone-800">{total}</span>{' '}
                  berita
                </p>
                <div className="flex items-center gap-1">
                  {page > 1 && (
                    <Button asChild variant="outline" size="icon-sm" aria-label="Sebelumnya">
                      <Link href={buildHref(page - 1)}>
                        <ChevronLeft className="size-4" />
                      </Link>
                    </Button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      asChild
                      variant={p === page ? 'default' : 'outline'}
                      size="icon-sm"
                    >
                      <Link href={buildHref(p)}>{p}</Link>
                    </Button>
                  ))}
                  {page < totalPages && (
                    <Button asChild variant="outline" size="icon-sm" aria-label="Berikutnya">
                      <Link href={buildHref(page + 1)}>
                        <ChevronRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Section>
    </PageWrapper>
  )
}
