import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Calendar, User, ArrowLeft, Newspaper, Share2, Tag as TagIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate, stripHtml, truncate } from '@/lib/utils'
import { sanitizeRichText } from '@/lib/sanitize'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { Tag } from '@/components/ui/tag'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { getBeritaDetail } from '@/lib/cache'
import { articleLd, breadcrumbLd, ldScript, SITE } from '@/lib/structured-data'

interface Props {
  params: Promise<{ slug: string }>
}

// Helper: Date | string | null | undefined → ISO string | undefined
// Di Vercel, unstable_cache bisa mengembalikan Date sebagai string setelah re-serialize.
const toIso = (v: Date | string | null | undefined): string | undefined => {
  if (!v) return undefined
  if (typeof v === 'string') return v
  return v.toISOString()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { berita } = await getBeritaDetail(slug)
  if (!berita) return { title: 'Berita' }
  const description = truncate(stripHtml(berita.konten), 160)
  return {
    title: berita.judul,
    description,
    alternates: { canonical: `/berita/${berita.slug}` },
    openGraph: {
      title: berita.judul,
      description,
      url: `${SITE.url}/berita/${berita.slug}`,
      publishedTime: toIso(berita.created_at),
      authors: [berita.author.name],
      images: berita.thumbnail ? [{ url: berita.thumbnail, alt: berita.judul }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: berita.judul, description, images: berita.thumbnail ? [berita.thumbnail] : undefined },
    keywords: ['berita Desa Sukobubuk', berita.judul, 'Kecamatan Margorejo', 'Jawa Tengah'],
  }
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params
  const { berita, lainnya } = await getBeritaDetail(slug)

  if (!berita) notFound()

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldScript(
          articleLd({
            slug: berita.slug,
            judul: berita.judul,
            deskripsi: truncate(stripHtml(berita.konten), 200),
            thumbnail: berita.thumbnail,
            tanggal: berita.created_at,
            author: berita.author.name,
          })
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldScript(
          breadcrumbLd([
            { name: 'Beranda', url: '/' },
            { name: 'Berita', url: '/berita' },
            { name: berita.judul, url: `/berita/${berita.slug}` },
          ])
        )}
      />
      <PageHeader
        title={berita.judul}
        breadcrumbs={[{ label: 'Berita', href: '/berita' }, { label: 'Detail' }]}
        variant="light"
        size="wide"
      >
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-stone-600">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-4" />
            {formatDate(berita.created_at)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="size-4" />
            {berita.author.name}
          </span>
        </div>
      </PageHeader>

      <Section spacing="default">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-10">
          {/* Article */}
          <article className="lg:col-span-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mb-6 text-sage-700 hover:bg-sage-50"
            >
              <Link href="/berita">
                <ArrowLeft className="size-4" data-icon="inline-start" />
                Kembali ke daftar berita
              </Link>
            </Button>

            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-3xl bg-gradient-to-br from-sage-200 to-stone-200">
              {berita.thumbnail ? (
                <Image
                  src={berita.thumbnail}
                  alt={berita.judul}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="grid size-full place-items-center">
                  <Newspaper className="size-24 text-stone-400" />
                </div>
              )}
            </div>

            <div
              className="prose-content max-w-none"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(berita.konten) }}
            />

            {/* Footer artikel */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6">
              <Button asChild variant="outline" size="sm">
                <Link href="/berita">
                  <TagIcon className="size-3.5" data-icon="inline-start" />
                  Berita lainnya
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-sage-700 hover:bg-sage-50">
                <Share2 className="size-4" data-icon="inline-start" />
                Bagikan
              </Button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
            <div className="surface-elevated p-5">
              <h3 className="section-eyebrow mb-4 text-stone-500">Berita Lainnya</h3>
              <div className="flex flex-col gap-3">
                {lainnya.map((item) => (
                  <Link
                    key={item.id}
                    href={`/berita/${item.slug}`}
                    className="group flex gap-3 rounded-xl p-2 -m-2 transition-colors hover:bg-stone-50"
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
                      <p className="mt-1 text-xs text-stone-500">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </PageWrapper>
  )
}
