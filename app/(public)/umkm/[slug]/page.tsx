import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Store, MapPin, Phone, Package, ArrowLeft, ArrowRight, Star, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import PageWrapper from '@/components/animations/PageWrapper'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const umkm = await prisma.uMKM.findUnique({ where: { slug } })
  return { title: umkm?.nama_usaha ?? 'UMKM' }
}

export default async function UMKMDetailPage({ params }: Props) {
  const { slug } = await params
  const umkm = await prisma.uMKM.findUnique({
    where: { slug },
    include: { produk: { where: { is_available: true }, orderBy: { created_at: 'asc' } } },
  })

  if (!umkm) notFound()

  const waLink = `https://wa.me/${umkm.whatsapp}?text=Halo%20${encodeURIComponent(umkm.nama_usaha)}%2C%20saya%20ingin%20mengetahui%20lebih%20lanjut%20tentang%20produk%20Anda.`

  return (
    <PageWrapper>
      <div className="pt-24">
        <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-16">
          <div className="container-custom">
            <Link href="/umkm" className="inline-flex items-center gap-2 text-primary-300 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Daftar UMKM
            </Link>
            <div className="flex items-start gap-6">
              {/* Logo UMKM */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/10 backdrop-blur flex-shrink-0">
                {umkm.logo ? (
                  <Image src={umkm.logo} alt={umkm.nama_usaha} width={80} height={80} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="badge bg-primary-500 text-white">{umkm.kategori}</span>
                  {umkm.is_featured && <span className="badge bg-yellow-400 text-yellow-900 flex items-center gap-1"><Star className="w-3 h-3" />Unggulan</span>}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">{umkm.nama_usaha}</h1>
                <p className="text-primary-200 mt-1">Pemilik: {umkm.pemilik}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="card p-6">
                <h2 className="font-display font-bold text-xl text-gray-900 mb-4">Tentang Usaha</h2>
                <p className="text-gray-700 leading-relaxed">{umkm.deskripsi}</p>
              </div>

              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display font-bold text-xl text-gray-900">
                    Produk Tersedia
                    <span className="ml-2 text-sm font-sans font-normal text-gray-500">({umkm.produk.length} produk)</span>
                  </h2>
                </div>

                {umkm.produk.length === 0 ? (
                  <div className="card p-12 text-center text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Belum ada produk tersedia</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {umkm.produk.map((produk) => (
                      <Link key={produk.id} href={`/umkm/${umkm.slug}/produk/${produk.slug}`} className="card group hover:-translate-y-1 transition-transform duration-300">
                        <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          {produk.foto ? (
                            <Image src={produk.foto} alt={produk.nama_produk} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Package className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors text-sm leading-snug">
                            {produk.nama_produk}
                          </h3>
                          <p className="text-primary-600 font-bold mt-1">{formatCurrency(produk.harga.toString())}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{produk.deskripsi}</p>
                          <div className="mt-3 flex items-center gap-1 text-primary-600 text-xs font-semibold group-hover:gap-2 transition-all">
                            Lihat Detail <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="card p-6 space-y-4">
                <h3 className="font-display font-bold text-lg text-gray-900">Informasi Kontak</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600">{umkm.alamat}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary-600 flex-shrink-0" />
                  <p className="text-sm text-gray-600">+{umkm.whatsapp}</p>
                </div>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center bg-green-600 hover:bg-green-700">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Hubungi via WhatsApp
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <Link href="/umkm" className="btn-outline w-full justify-center">
                <ArrowLeft className="w-4 h-4" />
                Lihat UMKM Lain
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
