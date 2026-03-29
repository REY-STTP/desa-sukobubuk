import Link from 'next/link'
import Image from 'next/image'
import { Store, ArrowRight, MapPin } from 'lucide-react'
import { UMKM } from '@prisma/client'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer, { StaggerItem } from '@/components/animations/StaggerContainer'
import HoverCard from '@/components/animations/HoverCard'

interface Props {
  umkm: UMKM[]
}

const kategoriColors: Record<string, string> = {
  'Makanan': 'bg-amber-100 text-amber-700',
  'Kerajinan': 'bg-purple-100 text-purple-700',
  'Jasa': 'bg-blue-100 text-blue-700',
  'Pertanian': 'bg-primary-100 text-primary-700',
}

export default function FeaturedUMKM({ umkm }: Props) {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <ScrollReveal className="mb-8 md:mb-12">
          {/* Header: title & subtitle */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm mb-3">
              <Store className="w-4 h-4" />
              UMKM Unggulan
            </div>
            <h2 className="section-title">Produk Lokal <span className="text-primary-600 italic">Terbaik</span></h2>
            <p className="section-subtitle max-w-lg">Temukan berbagai produk unggulan dari pengusaha lokal yang berkualitas tinggi.</p>
          </div>
          {/* CTA button — full width on mobile, auto on desktop */}
          <Link href="/umkm" className="btn-outline w-full justify-center md:w-auto md:inline-flex">
            Lihat Semua UMKM
            <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6" staggerDelay={0.12}>
          {umkm.map((item) => (
            <StaggerItem key={item.id}>
              <HoverCard>
                <Link href={`/umkm/${item.slug}`} className="card group block h-full">
                  {/* Logo / Cover */}
                  <div className="aspect-square bg-gradient-to-br from-primary-100 to-sage-100 relative overflow-hidden">
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt={item.nama_usaha}
                        fill
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Store className="w-16 h-16 text-primary-300 group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    )}

                    <div className="absolute top-3 left-3">
                      <span className={`badge ${kategoriColors[item.kategori] || 'bg-gray-100 text-gray-600'}`}>
                        {item.kategori}
                      </span>
                    </div>

                    {item.is_featured && (
                      <div className="absolute top-3 right-3">
                        <span className="badge bg-yellow-400 text-yellow-900">⭐ Unggulan</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 md:p-5">
                    <h3 className="font-display font-bold text-base md:text-lg text-gray-900 group-hover:text-primary-700 transition-colors leading-snug">
                      {item.nama_usaha}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 mb-2">Pemilik: {item.pemilik}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.deskripsi}</p>

                    <div className="flex items-center gap-1.5 mt-3 md:mt-4 text-xs text-gray-400">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.alamat}</span>
                    </div>

                    <div className="mt-3 md:mt-4 flex items-center gap-2 text-primary-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      Lihat Detail
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