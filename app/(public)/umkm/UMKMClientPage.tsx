'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { Store, Search, Filter, MapPin, ArrowRight, Package, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag } from '@/components/ui/tag'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/section'
import { EmptyState } from '@/components/ui/empty-state'
import { PUBLIC_PAGE_SIZE } from '@/lib/cache'

interface UMKM {
  id: number
  nama_usaha: string
  slug: string
  pemilik: string
  kategori: string
  deskripsi: string
  alamat: string
  whatsapp: string
  logo: string | null
  is_featured: boolean
  created_at: Date
  _count: { produk: number }
}

interface Props {
  umkm: UMKM[]
  kategoriList: string[]
  page: number
  total: number
  totalPages: number
}

const kategoriToneMap: Record<string, 'ember' | 'stone' | 'sage' | 'muted'> = {
  Makanan: 'ember',
  Kerajinan: 'stone',
  Jasa: 'sage',
  Pertanian: 'sage',
}

export default function UMKMClientPage({ umkm, kategoriList, page, total, totalPages }: Props) {
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('Semua')

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return umkm.filter((item) => {
      const matchSearch =
        !q ||
        item.nama_usaha.toLowerCase().includes(q) ||
        item.pemilik.toLowerCase().includes(q) ||
        item.deskripsi.toLowerCase().includes(q)
      const matchKategori = kategori === 'Semua' || item.kategori === kategori
      return matchSearch && matchKategori
    })
  }, [umkm, search, kategori])

  const buildHref = (p: number) => (p === 1 ? '/umkm' : `/umkm?page=${p}`)

  // Featured = first item with is_featured, atau first item
  const featured = filtered.find((u) => u.is_featured) ?? filtered[0]
  const others = filtered.filter((u) => u.id !== featured?.id)

  return (
    <PageWrapper>
      <PageHeader
        title="UMKM Desa Sukobubuk"
        subtitle="Temukan produk dan layanan terbaik dari pengusaha lokal kami"
        breadcrumbs={[{ label: 'UMKM' }]}
        variant="light"
      />

      <Section spacing="default">
        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
            <Input
              type="text"
              placeholder="Cari nama usaha, pemilik, atau produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-11"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="size-4 shrink-0 text-stone-400" />
            {['Semua', ...kategoriList].map((k) => (
              <Button
                key={k}
                size="sm"
                variant={kategori === k ? 'default' : 'outline'}
                onClick={() => setKategori(k)}
                className="shrink-0"
              >
                {k}
              </Button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <p className="mb-8 text-sm text-stone-500">
          Menampilkan <span className="font-semibold text-stone-800">{filtered.length}</span> UMKM
          {kategori !== 'Semua' && (
            <span>
              {' '}
              dalam kategori <span className="font-semibold text-sage-700">{kategori}</span>
            </span>
          )}
          {search && (
            <span>
              {' '}
              untuk &quot;<span className="font-semibold">{search}</span>&quot;
            </span>
          )}
        </p>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Store className="size-6" />}
            title="UMKM tidak ditemukan"
            description="Coba ubah kata kunci pencarian atau pilih kategori lain."
          />
        ) : (
          <>
            {/* Featured (hanya jika tidak ada filter aktif dan featured ada di list) */}
            {featured && !search && kategori === 'Semua' && (
              <div className="mb-8 md:mb-12">
                <Link
                  href={`/umkm/${featured.slug}`}
                  className="group block"
                >
                  <article className="surface-elevated grid grid-cols-1 overflow-hidden rounded-3xl md:grid-cols-5 md:items-stretch">
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-sage-100 to-stone-100 md:col-span-2">
                      {featured.logo ? (
                        <Image
                          src={featured.logo}
                          alt={featured.nama_usaha}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="grid size-full place-items-center">
                          <Store className="size-20 text-sage-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-3 p-6 md:col-span-3 md:p-8">
                      <div className="flex flex-wrap items-center gap-2">
                        <Tag tone={kategoriToneMap[featured.kategori] ?? 'sage'}>
                          {featured.kategori}
                        </Tag>
                        {featured.is_featured && (
                          <Tag tone="ember" className="bg-ember-50 text-ember-700">
                            <Sparkles className="size-3" />
                            Unggulan
                          </Tag>
                        )}
                      </div>
                      <h3 className="font-display text-2xl font-medium leading-tight text-stone-800 group-hover:text-sage-700 transition-colors text-balance md:text-3xl">
                        {featured.nama_usaha}
                      </h3>
                      <p className="text-sm text-stone-500">Pemilik: {featured.pemilik}</p>
                      <p className="line-clamp-3 text-sm leading-relaxed text-stone-600">
                        {featured.deskripsi}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                        <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
                          <Package className="size-3.5" />
                          {featured._count.produk} produk
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-700 transition-all group-hover:gap-2.5">
                          Lihat detail
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {(search || kategori !== 'Semua' ? filtered : others).map((item) => (
                <Link
                  key={item.id}
                  href={`/umkm/${item.slug}`}
                  className="group block"
                >
                  <article className="surface-elevated flex h-full flex-col overflow-hidden rounded-2xl">
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-sage-50 to-stone-100">
                      {item.logo ? (
                        <Image
                          src={item.logo}
                          alt={item.nama_usaha}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="grid size-full place-items-center">
                          <Store className="size-12 text-sage-300" />
                        </div>
                      )}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        <Tag tone={kategoriToneMap[item.kategori] ?? 'sage'} size="sm">
                          {item.kategori}
                        </Tag>
                        {item.is_featured && (
                          <Tag tone="ember" size="sm" className="bg-ember-50 text-ember-700">
                            <Sparkles className="size-3" />
                            Unggulan
                          </Tag>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-lg font-medium leading-snug text-stone-800 group-hover:text-sage-700 transition-colors line-clamp-2">
                        {item.nama_usaha}
                      </h3>
                      <p className="mt-0.5 text-xs text-stone-500 line-clamp-1">
                        {item.pemilik}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                        {item.deskripsi}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
                        <span className="inline-flex items-center gap-1">
                          <Package className="size-3" />
                          {item._count.produk}
                        </span>
                        <span className="inline-flex items-center gap-1 truncate">
                          <MapPin className="size-3" />
                          {item.alamat.split(',')[0]}
                        </span>
                      </div>
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sage-700 transition-all group-hover:gap-1.5">
                        Lihat detail
                        <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

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
                  UMKM
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
