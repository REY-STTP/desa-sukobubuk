'use client'

import { useState, useEffect } from 'react'
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

function GaleriMedia({ item, index, className = 'w-full h-full object-cover' }: {
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
        className={`${className} pointer-events-none`}
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
      <p className="text-white/60 text-sm font-medium px-6 text-center line-clamp-2">{item.judul}</p>
    </div>
  )
}

function getSlideProps(offset: number) {
  const abs = Math.abs(offset)
  const dir = Math.sign(offset)

  if (abs === 0) return {
    x: '0%', scale: 1, opacity: 1,
    zIndex: 30, rotateY: 0, brightness: 1,
    pointerEvents: 'auto' as const,
  }
  if (abs === 1) return {
    x: `${dir * 58}%`, scale: 0.78, opacity: 0.9,
    zIndex: 20, rotateY: dir * 20, brightness: 0.7,
    pointerEvents: 'none' as const,
  }
  if (abs === 2) return {
    x: `${dir * 76}%`, scale: 0.62, opacity: 0.5,
    zIndex: 10, rotateY: dir * 32, brightness: 0.5,
    pointerEvents: 'none' as const,
  }
  return { opacity: 0, zIndex: 0, pointerEvents: 'none' as const }
}

export default function GaleriSection({ galeri }: Props) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [dragStartX, setDragStartX] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const total = galeri.length

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

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

  const offsets = isMobile ? [0] : [-2, -1, 0, 1, 2]

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <ScrollReveal direction="none" className="text-center mb-10 md:mb-14">
          <div className="flex items-center justify-center gap-2 text-primary-600 font-semibold text-sm mb-3">
            <Images className="w-4 h-4" />
            Galeri Foto
          </div>
          <h2 className="section-title">Momen <span className="text-primary-600 italic">Berharga</span></h2>
          <p className="section-subtitle max-w-lg mx-auto">Abadikan setiap momen berharga kegiatan dan kehidupan desa.</p>
        </ScrollReveal>

        {/* Carousel */}
        <div className="relative" style={{ perspective: '1000px' }}>
          <div
            className="relative h-60 md:h-80 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
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
                    x: p.x ?? '0%',
                    scale: p.scale ?? 1,
                    opacity: p.opacity ?? 0,
                    rotateY: p.rotateY ?? 0,
                  }}
                  style={{
                    position: 'absolute',
                    width: isMobile ? '90%' : '54%',
                    maxWidth: '500px',
                    zIndex: p.zIndex,
                    transformStyle: 'preserve-3d',
                    pointerEvents: p.pointerEvents,
                    filter: `brightness(${p.brightness ?? 1})`,
                    cursor: isActive ? 'pointer' : 'default',
                  }}
                  transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                  onClick={() => isActive && setLightbox(idx)}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
                    <GaleriMedia item={galeri[idx]} index={idx} />

                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 md:p-5 pointer-events-none">
                        <p className="text-white font-bold text-sm md:text-lg leading-snug drop-shadow">
                          {galeri[idx].judul}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Arrows */}
          <button
            onClick={() => go(current - 1)}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => go(current + 1)}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {galeri.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2 bg-primary-500'
                  : 'w-2 h-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              className="relative max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <GaleriMedia
                item={galeri[lightbox]}
                index={lightbox}
                className="w-full object-contain rounded-xl"
              />

              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 bg-white/20 rounded-full p-2"
              >
                <X className="text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}