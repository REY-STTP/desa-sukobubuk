import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Calendar, User, ArrowLeft, Newspaper } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const berita = await prisma.berita.findUnique({ where: { slug } })
  return { title: berita?.judul ?? 'Berita' }
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params
  const berita = await prisma.berita.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  })

  if (!berita) notFound()

  const lainnya = await prisma.berita.findMany({
    where: { slug: { not: slug } },
    take: 3,
    orderBy: { created_at: 'desc' },
    include: { author: { select: { name: true } } },
  })

  return (
    <div className="pt-24">
      <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-16">
        <div className="container-custom max-w-4xl">
          <Link href="/berita" className="inline-flex items-center gap-2 text-primary-300 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Berita
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-snug">{berita.judul}</h1>
          <div className="flex items-center gap-6 mt-4 text-primary-200 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(berita.created_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {berita.author.name}
            </span>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Article */}
          <article className="lg:col-span-2">
            {/* Thumbnail */}
            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 bg-gradient-to-br from-primary-600 to-sage-700">
              {berita.thumbnail ? (
                <Image
                  src={berita.thumbnail}
                  alt={berita.judul}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Newspaper className="w-24 h-24 text-white/30" />
                </div>
              )}
            </div>
            <div
              className="prose-content"
              dangerouslySetInnerHTML={{ __html: berita.konten }}
            />
          </article>

          {/* Sidebar */}
          <aside>
            <h3 className="font-display font-bold text-lg text-gray-900 mb-4">Berita Lainnya</h3>
            <div className="space-y-4">
              {lainnya.map((item) => (
                <Link key={item.id} href={`/berita/${item.slug}`} className="flex gap-3 group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary-100 to-primary-200">
                    {item.thumbnail ? (
                      <Image src={item.thumbnail} alt={item.judul} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="w-6 h-6 text-primary-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-2 leading-snug">
                      {item.judul}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(item.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
