import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Store, MapPin, Phone, Package, ArrowLeft, Star, ExternalLink, Sparkles, MessageCircle, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { Section, SectionHeader } from '@/components/ui/section'
import { EmptyState } from '@/components/ui/empty-state'
import PageWrapper from '@/components/animations/PageWrapper'
import PageHeader from '@/components/layout/PageHeader'
import { getUMKMDetail } from '@/lib/cache'
import { localBusinessLd, breadcrumbLd, ldScript, SITE } from '@/lib/structured-data'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const umkm = await getUMKMDetail(slug)
  if (!umkm) return { title: 'UMKM' }
  return {
    title: umkm.nama_usaha,
    description: `${umkm.nama_usaha} — ${umkm.deskripsi.slice(0, 140)}`,
    alternates: { canonical: `/umkm/${umkm.slug}` },
    openGraph: {
      title: umkm.nama_usaha,
      description: umkm.deskripsi.slice(0, 200),
      url: `${SITE.url}/umkm/${umkm.slug}`,
      images: umkm.logo ? [{ url: umkm.logo, alt: umkm.nama_usaha }] : undefined,
    },
    twitter: { card: 'summary_large_image', title: umkm.nama_usaha, description: umkm.deskripsi.slice(0, 200) },
    keywords: ['UMKM', umkm.kategori, 'Desa Sukobubuk', umkm.nama_usaha],
  }
}

export default async function UMKMDetailPage({ params }: Props) {
  const { slug } = await params
  const umkm = await getUMKMDetail(slug)

  if (!umkm) notFound()

  const waMessage = `Halo ${umkm.nama_usaha}, saya tertarik dengan produk Anda. Apakah masih tersedia?`
  const waLink = `https://wa.me/${umkm.whatsapp}?text=${encodeURIComponent(waMessage)}`

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldScript(
          localBusinessLd({
            slug: umkm.slug,
            nama: umkm.nama_usaha,
            deskripsi: umkm.deskripsi,
            alamat: umkm.alamat,
            whatsapp: umkm.whatsapp,
            foto: umkm.logo,
            kategori: umkm.kategori,
          })
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldScript(
          breadcrumbLd([
            { name: 'Beranda', url: '/' },
            { name: 'UMKM', url: '/umkm' },
            { name: umkm.nama_usaha, url: `/umkm/${umkm.slug}` },
          ])
        )}
      />
      <PageHeader
        title={umkm.nama_usaha}
        breadcrumbs={[
          { label: 'UMKM', href: '/umkm' },
          { label: umkm.nama_usaha },
        ]}
        variant="gradient"
        pattern="grain"
      >
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            {umkm.logo ? (
              <Image
                src={umkm.logo}
                alt={umkm.nama_usaha}
                width={56}
                height={56}
                className="size-full object-contain"
                unoptimized
              />
            ) : (
              <Store className="size-7 text-white" />
            )}
          </div>
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Tag tone="sage" className="border border-white/15 bg-white/10 text-stone-100 ring-white/20 backdrop-blur">
                {umkm.kategori}
              </Tag>
              {umkm.is_featured && (
                <Tag tone="ember" className="border border-ember-200/30 bg-ember-500/20 text-ember-100 ring-ember-200/30 backdrop-blur">
                  <Sparkles className="size-3" />
                  Unggulan
                </Tag>
              )}
            </div>
            <p className="text-stone-200">Pemilik: {umkm.pemilik}</p>
          </div>
        </div>
      </PageHeader>

      <Section spacing="default">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="mb-2 self-start w-fit text-sage-700 hover:bg-sage-50"
            >
              <Link href="/umkm">
                <ArrowLeft className="size-4" data-icon="inline-start" />
                Kembali ke daftar UMKM
              </Link>
            </Button>

            {/* About */}
            <article className="surface-elevated p-6 md:p-8">
              <h2 className="font-display text-xl font-medium text-stone-800 mb-3">
                Tentang Usaha
              </h2>
              <p className="leading-relaxed text-stone-700">{umkm.deskripsi}</p>
            </article>

            {/* Produk */}
            <div>
              <SectionHeader
                eyebrow={<><Package className="size-3.5" /> Katalog</>}
                heading={
                  <>
                    Produk <span className="text-sage-700 italic">{umkm.nama_usaha}</span>
                  </>
                }
                subtitle={`${umkm.produk.length} produk tersedia untuk dipesan.`}
                align="left"
              />

              {umkm.produk.length === 0 ? (
                <EmptyState
                  icon={<Package className="size-6" />}
                  title="Belum ada produk"
                  description="Pemilik usaha belum menambahkan produk ke katalog."
                  size="sm"
                />
              ) : (
                <div className="grid grid-cols-2 gap-4 md:gap-5">
                  {umkm.produk.map((produk) => (
                    <Link
                      key={produk.id}
                      href={`/umkm/${umkm.slug}/produk/${produk.slug}`}
                      className="group block"
                    >
                      <article className="surface-elevated flex h-full flex-col overflow-hidden rounded-2xl">
                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200">
                          {produk.foto ? (
                            <Image
                              src={produk.foto}
                              alt={produk.nama_produk}
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
                          <h3 className="text-sm font-medium leading-snug text-stone-800 group-hover:text-sage-700 transition-colors line-clamp-2">
                            {produk.nama_produk}
                          </h3>
                          <p className="mt-1 font-mono text-sm font-semibold text-sage-700 tabular-nums">
                            {formatCurrency(produk.harga.toString())}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-stone-500">
                            {produk.deskripsi}
                          </p>
                          <span className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-sage-700 transition-all group-hover:gap-1.5">
                            Lihat detail
                            <ArrowLeft className="size-3 rotate-180" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sticky sidebar */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
            {/* WhatsApp CTA — primary action */}
            <div className="surface-elevated p-6">
              <h3 className="font-display text-lg font-medium text-stone-800 mb-1">
                Tertarik dengan produk ini?
              </h3>
              <p className="text-sm text-stone-500 mb-4">
                Hubungi langsung via WhatsApp untuk informasi harga & pemesanan.
              </p>
              <Button
                asChild
                size="lg"
                className="w-full bg-sage-700 text-white shadow-elevated-2 hover:bg-sage-800"
              >
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" data-icon="inline-start" />
                  Chat WhatsApp
                  <ExternalLink className="size-3" data-icon="inline-end" />
                </a>
              </Button>
            </div>

            {/* Info kontak */}
            <div className="surface-elevated p-6 flex flex-col gap-4">
              <h3 className="font-display text-lg font-medium text-stone-800">
                Informasi Kontak
              </h3>
              <div className="flex items-start gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-sage-700">
                  <MapPin className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-stone-500">Alamat</p>
                  <p className="text-sm leading-relaxed text-stone-800">
                    {umkm.alamat}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-sage-700">
                  <Phone className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-stone-500">WhatsApp</p>
                  <a
                    href={`https://wa.me/${umkm.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-stone-800 hover:text-sage-700"
                  >
                    +{umkm.whatsapp}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 border-t border-stone-100 pt-4">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-sage-700">
                  <Package className="size-4" />
                </div>
                <div>
                  <p className="text-xs text-stone-500">Total produk</p>
                  <p className="font-mono text-sm font-semibold text-stone-800 tabular-nums">
                    {umkm.produk.length}
                  </p>
                </div>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href="/umkm">
                <ArrowLeft className="size-4" data-icon="inline-start" />
                Lihat UMKM lain
              </Link>
            </Button>
          </aside>
        </div>
      </Section>
    </PageWrapper>
  )
}
