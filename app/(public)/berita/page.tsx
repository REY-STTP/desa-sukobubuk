import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Newspaper, Calendar, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate, stripHtml, truncate } from '@/lib/utils'
import PageWrapper from '@/components/animations/PageWrapper'
import { getBeritaPublik, PUBLIC_PAGE_SIZE } from '@/lib/cache'

export const metadata: Metadata = {
  title: 'Berita & Pengumuman',
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

  return (
    <PageWrapper>
      <div className="pt-24">
        <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-16">
          <div className="container-custom">
            <div className="flex items-center gap-2 text-primary-300 text-sm mb-3">
              <Newspaper className="w-4 h-4" />
              Berita & Pengumuman
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Berita Terkini</h1>
            <p className="text-primary-200 mt-2">Informasi dan pengumuman resmi Desa Sukobubuk</p>
          </div>
        </div>

        <div className="container-custom py-16">
          {berita.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Belum ada berita tersedia</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {berita.map((item) => (
                  <Link key={item.id} href={`/berita/${item.slug}`} className="card group hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-48 bg-gradient-to-br from-primary-700 to-sage-700 relative overflow-hidden">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.judul}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <Newspaper className="w-20 h-20 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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
                      <h3 className="font-display font-bold text-gray-900 group-hover:text-primary-700 transition-colors leading-snug">
                        {item.judul}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                        {truncate(stripHtml(item.konten), 150)}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-primary-600 font-semibold text-sm group-hover:gap-3 transition-all">
                        Baca Selengkapnya <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Menampilkan{' '}
                    <span className="font-semibold text-gray-900">
                      {(page - 1) * PUBLIC_PAGE_SIZE + 1}–{Math.min(page * PUBLIC_PAGE_SIZE, total)}
                    </span>{' '}
                    dari <span className="font-semibold text-gray-900">{total}</span> berita
                  </p>
                  <div className="flex items-center gap-1">
                    {page > 1 && (
                      <Link href={buildHref(page - 1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <Link
                        key={p}
                        href={buildHref(p)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold transition-colors ${
                          p === page
                            ? 'bg-primary-600 text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </Link>
                    ))}
                    {page < totalPages && (
                      <Link href={buildHref(page + 1)} className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}