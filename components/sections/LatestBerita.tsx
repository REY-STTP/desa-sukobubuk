import Link from 'next/link'
import Image from 'next/image'
import { Newspaper, ArrowRight, Calendar, User } from 'lucide-react'
import { formatDate, stripHtml, truncate } from '@/lib/utils'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer, { StaggerItem } from '@/components/animations/StaggerContainer'
import HoverCard from '@/components/animations/HoverCard'

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
  const [featured, ...rest] = berita

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <ScrollReveal className="mb-8 md:mb-12">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm mb-3">
              <Newspaper className="w-4 h-4" />
              Berita Terkini
            </div>
            <h2 className="section-title">Informasi & <span className="text-primary-600 italic">Pengumuman</span></h2>
            <p className="section-subtitle max-w-lg">Ikuti perkembangan terbaru seputar kegiatan dan program desa.</p>
          </div>
          {/* CTA button — full width on mobile */}
          <Link href="/berita" className="btn-outline w-full justify-center md:w-auto md:inline-flex">
            Semua Berita
            <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>

        {/* Mobile: simple stacked list */}
        <div className="flex flex-col gap-4 md:hidden">
          {berita.map((item) => (
            <HoverCard key={item.id} lift={3}>
              <Link href={`/berita/${item.slug}`} className="card group flex gap-3 p-3 items-start">
                {/* Thumbnail kecil */}
                <div className="w-24 h-20 shrink-0 bg-gradient-to-br from-primary-700 to-sage-700 relative overflow-hidden rounded-lg">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.judul}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <Newspaper className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.created_at)}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <User className="w-3 h-3" />
                      {item.author.name}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-gray-900 group-hover:text-primary-700 transition-colors leading-snug line-clamp-2">
                    {item.judul}
                  </h3>
                  <div className="mt-2 flex items-center gap-1 text-primary-600 font-semibold text-xs">
                    Baca
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            </HoverCard>
          ))}
        </div>

        {/* Desktop: bento grid */}
        <StaggerContainer className="hidden md:grid grid-cols-3 gap-6" staggerDelay={0.1}>
          {/* Featured article - spans 2 columns */}
          {featured && (
            <StaggerItem className="md:col-span-2 md:row-span-2">
              <HoverCard lift={5}>
                <Link href={`/berita/${featured.slug}`} className="card group block h-full">
                  <div className="bg-gradient-to-br from-primary-700 to-sage-700 relative overflow-hidden h-56 md:h-72">
                    {featured.thumbnail ? (
                      <Image
                        src={featured.thumbnail}
                        alt={featured.judul}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <Newspaper className="w-24 h-24 text-white group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="badge bg-primary-500 text-white">Berita</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(featured.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {featured.author.name}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-gray-900 group-hover:text-primary-700 transition-colors leading-snug">
                      {featured.judul}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {truncate(stripHtml(featured.konten), 120)}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-primary-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </HoverCard>
            </StaggerItem>
          )}

          {/* Remaining articles */}
          {rest.map((item) => (
            <StaggerItem key={item.id}>
              <HoverCard lift={5}>
                <Link href={`/berita/${item.slug}`} className="card group block h-full">
                  <div className="bg-gradient-to-br from-primary-700 to-sage-700 relative overflow-hidden h-44">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.judul}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <Newspaper className="w-24 h-24 text-white group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="badge bg-primary-500 text-white">Berita</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.author.name}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-base text-gray-900 group-hover:text-primary-700 transition-colors leading-snug">
                      {item.judul}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {truncate(stripHtml(item.konten), 120)}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-primary-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      Baca Selengkapnya
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}