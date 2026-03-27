import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ArrowLeft, Store, ExternalLink, Tag, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import PageWrapper from '@/components/animations/PageWrapper'

interface Props {
  params: Promise<{ slug: string; produkSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { produkSlug } = await params
  const produk = await prisma.produk.findUnique({ where: { slug: produkSlug } })
  return { title: produk?.nama_produk ?? 'Produk' }
}

export default async function ProdukDetailPage({ params }: Props) {
  const { slug, produkSlug } = await params

  const produk = await prisma.produk.findUnique({
    where: { slug: produkSlug },
    include: { umkm: true },
  })

  if (!produk || produk.umkm.slug !== slug) notFound()

  const produkLain = await prisma.produk.findMany({
    where: { umkm_id: produk.umkm_id, slug: { not: produkSlug }, is_available: true },
    take: 3,
  })

  const waMessage = `Halo ${produk.umkm.nama_usaha}, saya tertarik dengan produk *${produk.nama_produk}* seharga ${formatCurrency(produk.harga.toString())}. Apakah masih tersedia?`
  const waLink = `https://wa.me/${produk.umkm.whatsapp}?text=${encodeURIComponent(waMessage)}`

  return (
    <PageWrapper>
      <div className="pt-24">
        <div className="bg-gray-50 border-b border-gray-100 py-4">
          <div className="container-custom">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/umkm" className="hover:text-primary-600 transition-colors">UMKM</Link>
              <span>/</span>
              <Link href={`/umkm/${slug}`} className="hover:text-primary-600 transition-colors">{produk.umkm.nama_usaha}</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{produk.nama_produk}</span>
            </nav>
          </div>
        </div>

        <div className="container-custom py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Product Image */}
            <div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {produk.foto ? (
                  <Image
                    src={produk.foto}
                    alt={produk.nama_produk}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <Link href={`/umkm/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-primary-600 font-semibold mb-3 hover:text-primary-700">
                  <Store className="w-4 h-4" />
                  {produk.umkm.nama_usaha}
                </Link>
                <h1 className="font-display text-3xl font-bold text-gray-900">{produk.nama_produk}</h1>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-display text-4xl font-bold text-primary-600">
                  {formatCurrency(produk.harga.toString())}
                </span>
                {produk.is_available ? (
                  <span className="badge badge-green flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Tersedia
                  </span>
                ) : (
                  <span className="badge badge-gray">Tidak Tersedia</span>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Deskripsi Produk</h3>
                <p className="text-gray-600 leading-relaxed">{produk.deskripsi}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Dijual oleh:</span>
                  <span className="font-semibold text-gray-900">{produk.umkm.nama_usaha}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Kategori:</span>
                  <span className="font-semibold text-gray-900">{produk.umkm.kategori}</span>
                </div>
              </div>

              {produk.is_available && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center text-base py-4 bg-green-600 hover:bg-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Hubungi via WhatsApp
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <Link href={`/umkm/${slug}`} className="btn-ghost w-full justify-center">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke {produk.umkm.nama_usaha}
              </Link>
            </div>
          </div>

          {/* Other products */}
          {produkLain.length > 0 && (
            <div className="max-w-5xl mx-auto mt-16">
              <h2 className="font-display font-bold text-xl text-gray-900 mb-6">
                Produk Lain dari {produk.umkm.nama_usaha}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {produkLain.map((item) => (
                  <Link key={item.id} href={`/umkm/${slug}/produk/${item.slug}`} className="card group hover:-translate-y-1 transition-transform duration-300">
                    <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {item.foto ? (
                        <Image src={item.foto} alt={item.nama_produk} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-sm text-gray-900 group-hover:text-primary-700 transition-colors">{item.nama_produk}</p>
                      <p className="text-primary-600 font-bold text-sm mt-1">{formatCurrency(item.harga.toString())}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
