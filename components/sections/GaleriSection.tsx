'use client'

import { useState } from 'react'
import { Images, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Galeri } from '@prisma/client'
import { motion, AnimatePresence } from 'framer-motion'
import ScrollReveal from '@/components/animations/ScrollReveal'

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

function GaleriMedia({
  item,
  index,
  className = 'w-full h-full object-cover',
}: {
  item: Galeri
  index: number
  className?: string
}) {
  const gradient = placeholderGradients[index % placeholderGradients.length]
  const hasValidFoto = item.foto?.startsWith('/uploads/')

  if (hasValidFoto) {
    return (
      <img
        src={item.foto!}
        alt={item.judul}
        className={`${className} pointer-events-none select-none`}
        draggable={false}
      />
    )
  }

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3 pointer-events-none"
      style={{ background: gradient }}
    >
      <Images className="w-12 h-12 text-white/40" />
      <p className="text-white/60 text-sm font-medium px-6 text-center line-clamp-2">
        {item.judul}
      </p>
    </div>
  )
}

function getSlideProps(offset: number) {
  const abs = Math.abs(offset)
  const dir = Math.sign(offset)

  if (abs === 0)
    return {
      x: '0%',
      scale: 1,
      opacity: 1,
      zIndex: 30,
      rotateY: 0,
      brightness: 1,
      blur: 0,
      saturate: 1,
    }

  if (abs === 1)
    return {
      x: `${dir * 58}%`,
      scale: 0.82,
      opacity: 0.95,
      zIndex: 20,
      rotateY: dir * 18,
      brightness: 0.75,
      blur: 2,
      saturate: 0.85,
    }

  if (abs === 2)
    return {
      x: `${dir * 76}%`,
      scale: 0.65,
      opacity: 0.5,
      zIndex: 10,
      rotateY: dir * 28,
      brightness: 0.5,
      blur: 4,
      saturate: 0.7,
    }

  return { opacity: 0, zIndex: 0 }
}

export default function GaleriSection({ galeri }: Props) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [dragStartX, setDragStartX] = useState<number | null>(null)

  const total = galeri.length

  function go(idx: number) {
    setCurrent((idx + total) % total)
  }

  function onPointerDown(e: React.PointerEvent) {
    setDragStartX(e.clientX)
  }

  function onPointerUp(e: React.PointerEvent) {
    if (dragStartX === null) return
    const diff = dragStartX - e.clientX
    if (Math.abs(diff) > 40) {
      diff > 0 ? go(current + 1) : go(current - 1)
    }
    setDragStartX(null)
  }

  const offsets = [-2, -1, 0, 1, 2]

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">

        {/* HEADER */}
        <ScrollReveal direction="none" className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-primary-600 font-semibold text-sm mb-3">
            <Images className="w-4 h-4" />
            Galeri Foto
          </div>
          <h2 className="section-title">
            Momen <span className="text-primary-600 italic">Berharga</span>
          </h2>
          <p className="section-subtitle max-w-lg mx-auto">
            Abadikan setiap momen berharga kegiatan dan kehidupan desa.
          </p>
        </ScrollReveal>

        {/* CAROUSEL */}
        <div className="relative" style={{ perspective: '1200px' }}>
          <div
            className="relative h-64 md:h-80 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            {offsets.map((offset) => {
              const idx = (current + offset + total) % total
              const p = getSlideProps(offset)
              const isActive = offset === 0

              return (
                <motion.div
                  key={idx + '-' + offset}
                  animate={{
                    x: p.x,
                    scale: p.scale,
                    opacity: p.opacity,
                    rotateY: p.rotateY,
                  }}
                  style={{
                    position: 'absolute',
                    width: '56%',
                    maxWidth: '520px',
                    zIndex: p.zIndex,
                    transformStyle: 'preserve-3d',
                    filter: `
                      brightness(${p.brightness})
                      blur(${p.blur}px)
                      saturate(${p.saturate})
                    `,
                    cursor: isActive ? 'pointer' : 'default',
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 120,
                    damping: 18,
                  }}
                  onClick={() => isActive && setLightbox(idx)}
                >
                  <div className="flex flex-col items-center">

                    {/* IMAGE */}
                    <div
                      className="relative rounded-2xl overflow-hidden shadow-2xl w-full group"
                      style={{ aspectRatio: '16/9' }}
                    >
                      <GaleriMedia item={galeri[idx]} index={idx} />

                      {/* HOVER GLOW */}
                      {isActive && (
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition duration-300" />
                      )}

                      {/* DESKTOP OVERLAY */}
                      {isActive && (
                        <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent items-end p-5">
                          <p className="text-white font-bold text-lg drop-shadow-lg">
                            {galeri[idx].judul}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* MOBILE TITLE (FIX HEIGHT) */}
                    {isActive && (
                      <div className="md:hidden mt-3 w-full flex justify-center px-2">
                        <div className="h-[44px] flex items-center justify-center">
                          <p className="text-gray-800 font-semibold text-sm text-center line-clamp-2 leading-tight">
                            {galeri[idx].judul}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* ARROWS (GLASS STYLE) */}
          <button
            onClick={() => go(current - 1)}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full 
            bg-green-400/80 backdrop-blur-md text-white 
            hover:bg-green-600/90 hover:scale-110 
            transition flex items-center justify-center shadow-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => go(current + 1)}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full 
            bg-green-400/80 backdrop-blur-md text-white 
            hover:bg-green-600/90 hover:scale-110 
            transition flex items-center justify-center shadow-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="relative max-w-5xl w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GaleriMedia
                item={galeri[lightbox]}
                index={lightbox}
                className="w-full object-contain rounded-xl"
              />

              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 bg-white/20 backdrop-blur-md rounded-full p-2"
              >
                <X className="text-white w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}