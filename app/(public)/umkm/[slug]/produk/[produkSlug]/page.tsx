import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  ArrowLeft,
  Store,
  ExternalLink,
  Tag as TagIcon,
  CheckCircle,
  XCircle,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { Section, SectionHeader } from '@/components/ui/section'
import { EmptyState } from '@/components/ui/empty-state'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { getProdukDetail, getProdukLain } from '@/lib/cache'
import { productLd, breadcrumbLd, ldScript, SITE } from '@/lib/structured-data'

interface Props {
  params: Promise<{ slug: string; produkSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { produkSlug, slug } = await params
  const produk = await getProdukDetail(produkSlug)
  if (!produk || !produk.umkm) return { title: 'Produk' }
  return {
    title: `${produk.nama_produk} – ${produk.umkm.nama_usaha}`,
    description: `${produk.nama_produk} dari ${produk.umkm.nama_usaha}, ${formatCurrency(produk.harga.toString())}. ${produk.deskripsi.slice(0, 120)}`,
    alternates: { canonical: `/umkm/${slug}/produk/${produkSlug}` },
    openGraph: {
      title: `${produk.nama_produk} – ${produk.umkm.nama_usaha}`,
      description: produk.deskripsi,
      url: `${SITE.url}/umkm/${slug}/produk/${produkSlug}`,
      images: produk.foto ? [{ url: produk.foto, alt: produk.nama_produk }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: produk.nama_produk, description: produk.deskripsi },
    keywords: [produk.nama_produk, 'produk lokal', 'UMKM Desa Sukobubuk', produk.umkm.kategori],
  }
}

export default async function ProdukDetailPage({ params }: Props) {
  const { slug, produkSlug } = await params

  const produk = await getProdukDetail(produkSlug)

  if (!produk || produk.umkm.slug !== slug) notFound()

  const produkLain = await getProdukLain(produk.umkm_id, produkSlug)

  const waMessage = `Halo ${produk.umkm.nama_usaha}, saya tertarik dengan produk *${produk.nama_produk}* seharga ${formatCurrency(produk.harga.toString())}. Apakah masih tersedia?`
  const waLink = `https://wa.me/${produk.umkm.whatsapp}?text=${encodeURIComponent(waMessage)}`

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldScript(
          productLd({
            slug: produk.slug,
            nama: produk.nama_produk,
            deskripsi: produk.deskripsi,
            harga: Number(produk.harga),
            foto: produk.foto,
            umkm_nama: produk.umkm.nama_usaha,
            umkm_slug: produk.umkm.slug,
            tersedia: produk.is_available,
          })
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldScript(
          breadcrumbLd([
            { name: 'Beranda', url: '/' },
            { name: 'UMKM', url: '/umkm' },
            { name: produk.umkm.nama_usaha, url: `/umkm/${produk.umkm.slug}` },
            { name: produk.nama_produk, url: `/umkm/${produk.umkm.slug}/produk/${produk.slug}` },
          ])
        )}
      />
      <PageHeader
        title={produk.nama_produk}
        breadcrumbs={[
          { label: 'UMKM', href: '/umkm' },
          { label: produk.umkm.nama_usaha, href: `/umkm/${slug}` },
          { label: produk.nama_produk },
        ]}
        variant="light"
      />

      <Section spacing="default">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Gallery — 3/5 */}
          <div className="lg:col-span-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mb-4 text-sage-700 hover:bg-sage-50"
            >
              <Link href={`/umkm/${slug}`}>
                <ArrowLeft className="size-4" data-icon="inline-start" />
                Kembali ke {produk.umkm.nama_usaha}
              </Link>
            </Button>

            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-stone-100 to-stone-200 ring-1 ring-stone-200/60">
              {produk.foto ? (
                <Image
                  src={produk.foto}
                  alt={produk.nama_produk}
                  fill
                  className="object-contain p-6"
                  unoptimized
                />
              ) : (
                <div className="grid size-full place-items-center">
                  <Package className="size-24 text-stone-300" />
                </div>
              )}
              {!produk.is_available && (
                <div className="absolute right-4 top-4">
                  <Tag tone="stone" size="sm" className="bg-stone-900/80 text-stone-50 ring-stone-900/40 backdrop-blur">
                    <XCircle className="size-3" />
                    Tidak tersedia
                  </Tag>
                </div>
              )}
            </div>
          </div>

          {/* Info — 2/5 */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <div className="flex items-center gap-2">
              {produk.is_available ? (
                <Tag tone="sage">
                  <CheckCircle className="size-3" />
                  Tersedia
                </Tag>
              ) : (
                <Tag tone="stone">
                  <XCircle className="size-3" />
                  Tidak tersedia
                </Tag>
              )}
            </div>

            <div>
              <p className="font-mono text-4xl font-medium text-sage-700 tabular-nums md:text-5xl">
                {formatCurrency(produk.harga.toString())}
              </p>
              <p className="mt-1 text-sm text-stone-500">Harga satuan</p>
            </div>

            <div>
              <h3 className="mb-2 font-display text-base font-medium text-stone-800">
                Deskripsi Produk
              </h3>
              <p className="leading-relaxed text-stone-700">{produk.deskripsi}</p>
            </div>

            {/* Info toko */}
            <div className="rounded-2xl bg-stone-50 p-4 flex flex-col gap-3 ring-1 ring-stone-200/60">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Dijual oleh
              </p>
              <Link
                href={`/umkm/${slug}`}
                className="group flex items-center gap-3"
              >
                <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-stone-200">
                  {produk.umkm.logo ? (
                    <Image
                      src={produk.umkm.logo}
                      alt={produk.umkm.nama_usaha}
                      width={40}
                      height={40}
                      className="size-full object-contain"
                      unoptimized
                    />
                  ) : (
                    <Store className="size-5 text-sage-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-800 group-hover:text-sage-700 transition-colors line-clamp-1">
                    {produk.umkm.nama_usaha}
                  </p>
                  <p className="text-xs text-stone-500 line-clamp-1">
                    {produk.umkm.pemilik}
                  </p>
                </div>
                <Tag tone="sage" size="sm">
                  {produk.umkm.kategori}
                </Tag>
              </Link>
            </div>

            {produk.is_available && (
              <Button
                asChild
                size="lg"
                className="w-full bg-sage-700 text-white shadow-elevated-2 hover:bg-sage-800"
              >
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-5" data-icon="inline-start" />
                  Pesan via WhatsApp
                  <ExternalLink className="size-3" data-icon="inline-end" />
                </a>
              </Button>
            )}

            <Button asChild variant="outline" className="w-full">
              <Link href={`/umkm/${slug}`}>
                <ArrowLeft className="size-4" data-icon="inline-start" />
                Lihat produk lainnya
              </Link>
            </Button>
          </div>
        </div>

        {/* Related produk */}
        {produkLain.length > 0 && (
          <div className="mx-auto mt-16 max-w-6xl">
            <SectionHeader
              eyebrow={<><ShoppingBag className="size-3.5" /> Produk Lain</>}
              heading={
                <>
                  Lainnya dari{' '}
                  <span className="text-sage-700 italic">
                    {produk.umkm.nama_usaha}
                  </span>
                </>
              }
              subtitle="Produk-produk lain yang mungkin Anda sukai."
              align="left"
            />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
              {produkLain.map((item) => (
                <Link
                  key={item.id}
                  href={`/umkm/${slug}/produk/${item.slug}`}
                  className="group block"
                >
                  <article className="surface-elevated flex h-full flex-col overflow-hidden rounded-2xl">
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
                      {item.foto ? (
                        <Image
                          src={item.foto}
                          alt={item.nama_produk}
                          fill
                          className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="grid size-full place-items-center">
                          <Package className="size-10 text-stone-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-sm font-medium leading-snug text-stone-800 group-hover:text-sage-700 transition-colors line-clamp-2">
                        {item.nama_produk}
                      </p>
                      <p className="mt-1 font-mono text-sm font-semibold text-sage-700 tabular-nums">
                        {formatCurrency(item.harga.toString())}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </Section>
    </PageWrapper>
  )
}
