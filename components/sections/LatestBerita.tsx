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
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm mb-3">
              <Newspaper className="w-4 h-4" />
              Berita Terkini
            </div>
            <h2 className="section-title">Informasi & <span className="text-primary-600 italic">Pengumuman</span></h2>
            <p className="section-subtitle max-w-lg">Ikuti perkembangan terbaru seputar kegiatan dan program Desa Sukobubuk.</p>
          </div>
          <Link href="/berita" className="btn-outline flex-shrink-0">
            Semua Berita
            <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.1}>
          {berita.map((item, index) => (
            <StaggerItem key={item.id} className={index === 0 ? 'md:col-span-2 md:row-span-2' : ''}>
              <HoverCard lift={5}>
                <Link href={`/berita/${item.slug}`} className="card group block h-full">
                  {/* Thumbnail */}
                  <div className={`bg-gradient-to-br from-primary-700 to-sage-700 relative overflow-hidden ${index === 0 ? 'h-56 md:h-72' : 'h-44'}`}>
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

                    <h3 className={`font-display font-bold text-gray-900 group-hover:text-primary-700 transition-colors leading-snug ${index === 0 ? 'text-xl' : 'text-base'}`}>
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
