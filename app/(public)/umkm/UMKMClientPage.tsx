'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Store, ArrowRight, Package, Sparkles, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { shouldSkipImageOptimization } from '@/lib/image-optim'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { Section } from '@/components/ui/section'
import { EmptyState } from '@/components/ui/empty-state'
import SearchInput from '@/components/admin/SearchInput'
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
  search: string
  kategori: string
}

const kategoriToneMap: Record<string, 'ember' | 'stone' | 'sage' | 'muted'> = {
  Makanan: 'ember',
  Kerajinan: 'stone',
  Jasa: 'sage',
  Pertanian: 'sage',
}

// F2-FaseP2 / T-P22: data SUDAH difilter server (`where` di getUMKMPublik).
// Filter in-memory dihapus (itu bug: item halaman 2 tak ketemu dari
// halaman 1). Search via URL (debounce 300ms, pola admin); kategori via
// Link server. Komponen ini presentasional + search box saja.
export default function UMKMClientPage({ umkm, kategoriList, page, total, totalPages, search, kategori }: Props) {
  const params = new URLSearchParams()
  if (search) params.set('q', search)

  const filterHref = (k: string) => {
    const p = new URLSearchParams(params)
    if (k && k !== 'Semua') p.set('kategori', k)
    else p.delete('kategori')
    const s = p.toString()
    return s ? `/umkm?${s}` : '/umkm'
  }

  const buildHref = (p: number) => {
    const q = new URLSearchParams(params)
    if (kategori && kategori !== 'Semua') q.set('kategori', kategori)
    q.set('page', String(p))
    const s = q.toString()
    return s ? `/umkm?${s}` : '/umkm'
  }

  // Featured = first item with is_featured, atau first item
  const featured = umkm.find((u) => u.is_featured) ?? umkm[0]
  const others = umkm.filter((u) => u.id !== featured?.id)

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
            <SearchInput placeholder="Cari nama usaha, pemilik, atau produk..." defaultValue={search} />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['Semua', ...kategoriList].map((k) => (
              <Button
                key={k}
                asChild
                size="sm"
                variant={kategori === k ? 'default' : 'outline'}
                className="shrink-0"
              >
                <Link href={filterHref(k)} aria-current={kategori === k ? 'true' : undefined}>
                  {k}
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <p className="mb-8 text-sm text-stone-500">
          Menampilkan <span className="font-semibold text-stone-800">{total}</span> UMKM
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

        {umkm.length === 0 ? (
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
                          sizes="(min-width: 1024px) 40vw, 100vw"
                          // P1-C3: SATU-SATUNYA priority di halaman ini —
                          // thumbnail unggulan kandidat LCP. Sisanya lazy.
                          priority
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized={shouldSkipImageOptimization(featured.logo)}
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
                      <h2 className="font-display text-2xl font-medium leading-tight text-stone-800 group-hover:text-sage-700 transition-colors text-balance md:text-3xl">
                        {featured.nama_usaha}
                      </h2>
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
              {(search || kategori !== 'Semua' ? umkm : others).map((item) => (
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
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          unoptimized={shouldSkipImageOptimization(item.logo)}
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
                      <h2 className="font-display text-lg font-medium leading-snug text-stone-800 group-hover:text-sage-700 transition-colors line-clamp-2">
                        {item.nama_usaha}
                      </h2>
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
                      <Link
                        href={buildHref(p)}
                        aria-label={`Halaman ${p}`}
                        aria-current={p === page ? 'page' : undefined}
                      >
                        {p}
                      </Link>
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
