import Link from 'next/link'
import Image from 'next/image'
import { Newspaper, ArrowRight, Calendar, User } from 'lucide-react'
import { formatDate, stripHtml, truncate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Section, SectionHeader } from '@/components/ui/section'
import StaggerContainer, { StaggerItem } from '@/components/animations/StaggerContainer'

interface BeritaWithAuthor {
  id: number
  judul: string
  slug: string
  konten: string
  thumbnail: string | null
  created_at: Date
  author: { name: string }
}

interface Props {
  berita: BeritaWithAuthor[]
}

export default function LatestBerita({ berita }: Props) {
  if (!berita.length) return null

  const [featured, ...rest] = berita
  const recent = rest.slice(0, 4)

  return (
    <Section variant="subtle" spacing="default" pattern="topo">
      <SectionHeader
        eyebrow={
          <>
            <Newspaper className="size-3.5" />
            Berita Terkini
          </>
        }
        heading={
          <>
            Informasi &amp;{' '}
            <span className="text-sage-700 italic">pengumuman</span>
          </>
        }
        subtitle="Ikuti perkembangan terbaru seputar kegiatan dan program Desa Sukobubuk."
        action={
          <Button asChild variant="outline">
            <Link href="/berita">
              Semua berita
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Featured — 2/3 width */}
        <StaggerContainer className="lg:col-span-2" staggerDelay={0.1}>
          <StaggerItem>
            <Link
              href={`/berita/${featured.slug}`}
              className="group block h-full"
            >
              <article className="surface-elevated flex h-full flex-col overflow-hidden rounded-3xl">
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-sage-200 to-stone-200 md:aspect-[16/10]">
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
                    {truncate(stripHtml(featured.konten), 160)}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-sage-700 transition-all group-hover:gap-2.5">
                    Baca selengkapnya
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </article>
            </Link>
          </StaggerItem>
        </StaggerContainer>

        {/* Recent — 1/3 sidebar */}
        <aside className="flex flex-col gap-3">
          <p className="section-eyebrow text-stone-500 mb-2">Berita Lainnya</p>
          {recent.map((item) => (
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
    </Section>
  )
}
