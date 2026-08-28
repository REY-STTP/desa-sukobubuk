import Link from 'next/link'
import Image from 'next/image'
import { Store, ArrowRight, MapPin, Star, Sparkles } from 'lucide-react'
import { UMKM } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { Section, SectionHeader } from '@/components/ui/section'

interface Props {
  umkm: UMKM[]
}

const kategoriToneMap: Record<string, 'ember' | 'stone' | 'sage' | 'muted'> = {
  Makanan: 'ember',
  Kerajinan: 'stone',
  Jasa: 'sage',
  Pertanian: 'sage',
}

export default function FeaturedUMKM({ umkm }: Props) {
  if (!umkm.length) return null

  const [featured, ...rest] = umkm
  const small = rest.slice(0, 4)

  if (!small.length) {
    return (
      <Section variant="default" spacing="default">
        <SectionHeader
          eyebrow={
            <>
              <Store className="size-3.5" />
              UMKM Unggulan
            </>
          }
          heading={
            <>
              Produk lokal <span className="text-sage-700 italic">terbaik</span>
            </>
          }
          subtitle="UMKM pilihan yang menjadi kebanggaan warga Desa Sukobubuk."
          action={
            <Button asChild variant="outline">
              <Link href="/umkm">
                Lihat semua UMKM
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Link>
            </Button>
          }
        />
        <Link href={`/umkm/${featured.slug}`} className="group block max-w-3xl">
          <article className="surface-elevated flex flex-col overflow-hidden rounded-3xl sm:flex-row">
            <div className="relative aspect-square shrink-0 overflow-hidden bg-gradient-to-br from-sage-100 to-stone-100 sm:aspect-square sm:w-[42%]">
              {featured.logo ? (
                <Image src={featured.logo} alt={featured.nama_usaha} fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
              ) : (
                <div className="grid size-full place-items-center">
                  <Store className="size-16 text-sage-300" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6">
              <div className="flex flex-wrap gap-2">
                <Tag tone={kategoriToneMap[featured.kategori] ?? 'sage'}>{featured.kategori}</Tag>
                {featured.is_featured && (
                  <Tag tone="ember" className="bg-ember-50 text-ember-700">
                    <Sparkles className="size-3" />
                    Unggulan
                  </Tag>
                )}
              </div>
              <h3 className="font-display text-xl font-medium text-stone-800 group-hover:text-sage-700 md:text-2xl text-balance">
                {featured.nama_usaha}
              </h3>
              <p className="text-sm text-stone-500">Pemilik: {featured.pemilik}</p>
              <p className="line-clamp-3 text-sm leading-relaxed text-stone-600">{featured.deskripsi}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-sage-700">
                Lihat detail
                <ArrowRight className="size-4" />
              </span>
            </div>
          </article>
        </Link>
      </Section>
    )
  }

  return (
    <Section variant="default" spacing="default">
      <SectionHeader
        eyebrow={
          <>
            <Store className="size-3.5" />
            UMKM Unggulan
          </>
        }
        heading={
          <>
            Produk lokal <span className="text-sage-700 italic">terbaik</span>
          </>
        }
        subtitle="Lima UMKM pilihan yang menjadi kebanggaan warga Desa Sukobubuk."
        action={
          <Button asChild variant="outline">
            <Link href="/umkm">
              Lihat semua UMKM
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Link>
          </Button>
        }
      />

      {/* Bento 5: 1 besar + 4 kecil grid — 1:1 terisi penuh */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* 1 besar — lebih compact */}
        <Link href={`/umkm/${featured.slug}`} className="group block lg:col-span-7">
          <article className="surface-elevated flex h-full min-h-[360px] flex-col overflow-hidden rounded-3xl lg:min-h-[440px]">
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-sage-100 to-stone-100 lg:aspect-auto lg:flex-1">
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
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Tag tone={kategoriToneMap[featured.kategori] ?? 'sage'}>{featured.kategori}</Tag>
                {featured.is_featured && (
                  <Tag tone="ember" className="bg-ember-50 text-ember-700">
                    <Sparkles className="size-3" />
                    Unggulan
                  </Tag>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 p-5">
              <h3 className="font-display text-xl font-medium leading-tight text-stone-800 group-hover:text-sage-700 text-balance">
                {featured.nama_usaha}
              </h3>
              <p className="text-xs text-stone-500">Pemilik: {featured.pemilik}</p>
              <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">{featured.deskripsi}</p>
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
                  <MapPin className="size-3.5 shrink-0" />
                  <span className="truncate">{featured.alamat}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-sage-700">
                  Lihat detail
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </div>
          </article>
        </Link>

        {/* 4 kecil — 2×2 grid, seperti sebelumnya (bukan list) */}
        <div className="grid grid-cols-2 gap-5 lg:col-span-5 lg:grid-rows-2">
          {small.map((item) => (
            <Link key={item.id} href={`/umkm/${item.slug}`} className="group block">
              <article className="surface-elevated flex h-full flex-col overflow-hidden rounded-2xl">
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-sage-50 to-stone-100">
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
                      <Store className="size-10 text-sage-300" />
                    </div>
                  )}
                  <div className="absolute left-2.5 top-2.5">
                    <Tag tone={kategoriToneMap[item.kategori] ?? 'sage'} size="sm">
                      {item.kategori}
                    </Tag>
                  </div>
                  {item.is_featured && (
                    <span className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-ember-500 text-white shadow-sm">
                      <Star className="size-3.5 fill-white" />
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h3 className="line-clamp-2 font-display text-sm font-medium leading-snug text-stone-800 group-hover:text-sage-700">
                    {item.nama_usaha}
                  </h3>
                  <p className="line-clamp-1 text-xs text-stone-500">{item.pemilik}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-sage-700">
                    Detail
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </article>
            </Link>
          ))}
          {small.length < 4 &&
            Array.from({ length: 4 - small.length }).map((_, i) => (
              <div key={`ph-${i}`} aria-hidden className="hidden rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 lg:block" />
            ))}
        </div>
      </div>
    </Section>
  )
}
