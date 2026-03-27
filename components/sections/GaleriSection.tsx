'use client'

import { Images } from 'lucide-react'
import { Galeri } from '@prisma/client'
import { motion } from 'framer-motion'
import ScrollReveal from '@/components/animations/ScrollReveal'
import StaggerContainer, { StaggerItem } from '@/components/animations/StaggerContainer'

interface Props {
  galeri: Galeri[]
}

const placeholderGradients = [
  'linear-gradient(135deg, #4f8ef7 0%, #2563eb 100%)',
  'linear-gradient(135deg, #34d399 0%, #059669 100%)',
  'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
  'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
  'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
]

export default function GaleriSection({ galeri }: Props) {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <ScrollReveal direction="none" className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-primary-600 font-semibold text-sm mb-3">
            <Images className="w-4 h-4" />
            Galeri Foto
          </div>
          <h2 className="section-title">Momen <span className="text-primary-600 italic">Berharga</span></h2>
          <p className="section-subtitle max-w-lg mx-auto">Abadikan setiap momen berharga kegiatan dan kehidupan di Desa Sukobubuk.</p>
        </ScrollReveal>

        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" staggerDelay={0.08}>
          {galeri.map((item, index) => {
            const heightClass = index === 0 ? 'h-72 md:h-96' : 'h-36 md:h-48'
            const gradient = placeholderGradients[index % placeholderGradients.length]

            // Cek apakah foto adalah file lokal yang ada (starts with /uploads/)
            const isLocalUpload = item.foto?.startsWith('/uploads/')
            const hasValidFoto = item.foto && isLocalUpload

            return (
              <StaggerItem key={item.id} className={index === 0 ? 'col-span-2 row-span-2' : ''}>
                <motion.div
                  className="relative overflow-hidden rounded-2xl group cursor-pointer h-full"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {hasValidFoto ? (
                    <img
                      src={item.foto!}
                      alt={item.judul}
                      className={`w-full object-cover ${heightClass} group-hover:scale-105 transition-transform duration-500`}
                    />
                  ) : (
                    <div
                      className={`w-full ${heightClass} flex flex-col items-center justify-center gap-2`}
                      style={{ background: gradient }}
                    >
                      <Images className="w-10 h-10 text-white/50" />
                      <p className="text-white/70 text-xs font-medium px-4 text-center line-clamp-2">{item.judul}</p>
                    </div>
                  )}

                  <motion.div
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end p-4"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <p className="text-white text-sm font-semibold translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {item.judul}
                    </p>
                  </motion.div>
                </motion.div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}