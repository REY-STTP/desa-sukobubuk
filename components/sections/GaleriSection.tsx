'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Images, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Galeri } from '@prisma/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Section, SectionHeader } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

interface Props {
  galeri: Galeri[]
}

const placeholderGradients = [
  'linear-gradient(135deg, #5a7548 0%, #374a2b 100%)',
  'linear-gradient(135deg, #c27141 0%, #7e4220 100%)',
  'linear-gradient(135deg, #455c36 0%, #1f2a1a 100%)',
  'linear-gradient(135deg, #d3884f 0%, #a35a30 100%)',
  'linear-gradient(135deg, #79766a 0%, #403e37 100%)',
  'linear-gradient(135deg, #aebc8e 0%, #5a7548 100%)',
]

function GaleriMedia({
  item,
  index,
  className = 'size-full object-cover',
}: {
  item: Galeri
  index: number
  className?: string
}) {
  const gradient = placeholderGradients[index % placeholderGradients.length]
  // F-104: SEC-006 — accept both legacy local paths (pre-Cloudinary) and
  // absolute Cloudinary URLs.
  const hasValidFoto =
    !!item.foto &&
    (item.foto.startsWith('/uploads/') ||
      item.foto.startsWith('https://res.cloudinary.com/'))

  if (hasValidFoto) {
    return (
      <img
        src={item.foto!}
        alt={item.judul}
        className={className}
        draggable={false}
      />
    )
  }

  return (
    <div
      className="flex size-full flex-col items-center justify-center gap-3 p-6"
      style={{ background: gradient }}
    >
      <Images className="size-10 text-white/40" />
      <p className="line-clamp-2 text-center text-sm font-medium text-white/80">
        {item.judul}
      </p>
    </div>
  )
}

export default function GaleriSection({ galeri }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const total = galeri.length

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [updateScrollState, total])

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = Math.round(el.clientWidth * 0.85)
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight')
        setLightbox((i) => (i !== null ? (i + 1) % total : null))
      if (e.key === 'ArrowLeft')
        setLightbox((i) => (i !== null ? (i - 1 + total) % total : null))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox, total])

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightbox !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightbox])

  // Drag to scroll (mouse)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startScrollLeft = useRef(0)

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current
    if (!el) return
    isDragging.current = true
    startX.current = e.pageX - el.offsetLeft
    startScrollLeft.current = el.scrollLeft
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }
  const onMouseUp = () => {
    const el = scrollRef.current
    if (!el) return
    isDragging.current = false
    el.style.cursor = 'grab'
    el.style.userSelect = ''
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    e.preventDefault()
    const el = scrollRef.current
    if (!el) return
    const x = e.pageX - el.offsetLeft
    const walk = (x - startX.current) * 1.2
    el.scrollLeft = startScrollLeft.current - walk
  }
  const onMouseLeave = () => {
    const el = scrollRef.current
    if (!el) return
    isDragging.current = false
    el.style.cursor = 'grab'
    el.style.userSelect = ''
  }

  if (total === 0) return null

  return (
    <Section variant="default" spacing="default">
      <SectionHeader
        eyebrow={
          <>
            <Images className="size-3.5" />
            Galeri Foto
          </>
        }
        heading={
          <>
            Momen <span className="text-sage-700 italic">berharga</span>
          </>
        }
        subtitle="Geser untuk melihat dokumentasi kegiatan dan kehidupan Desa Sukobubuk."
        align="left"
      />

      {/* Horizontal scroll container */}
      <div className="relative -mx-5 sm:-mx-6 md:-mx-8 lg:-mx-10">
        {/* Edge fades — subtle hint */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-gradient-to-r from-white/30 to-transparent md:w-6"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-4 bg-gradient-to-l from-white/30 to-transparent md:w-6"
        />

        {/* Scroll track */}
        <div
          ref={scrollRef}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          className="flex gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-5 pb-2 pt-1 [scrollbar-width:none] sm:gap-5 sm:px-6 md:px-8 lg:px-10 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none', cursor: 'grab' }}
          role="region"
          aria-label="Galeri foto — geser untuk melihat lebih banyak"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault()
              scrollBy('right')
            }
            if (e.key === 'ArrowLeft') {
              e.preventDefault()
              scrollBy('left')
            }
          }}
        >
          {galeri.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => {
                // Jangan buka lightbox kalau sedang drag
                if (isDragging.current) return
                setLightbox(idx)
              }}
              className="group relative shrink-0 snap-start overflow-hidden rounded-2xl text-left shadow-elevated-2 ring-1 ring-stone-200/60 transition-all duration-300 hover:shadow-elevated-4 hover:ring-sage-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2"
              aria-label={`Buka foto: ${item.judul}`}
            >
              <div className="relative h-[220px] w-[300px] overflow-hidden sm:h-[260px] sm:w-[360px] md:h-[300px] md:w-[420px]">
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-[1.03]">
                  <GaleriMedia item={item} index={idx} />
                </div>
                {/* Caption overlay — always visible subtle, stronger on hover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sage-950/80 via-sage-900/30 to-transparent p-4 pt-12">
                  <p className="line-clamp-2 font-display text-sm font-medium leading-snug text-white drop-shadow-sm">
                    {item.judul}
                  </p>
                </div>
                {/* Hover ring accent */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 transition-colors group-hover:ring-white/20" />
              </div>
            </button>
          ))}
        </div>

        {/* Nav arrows — desktop, overlay on track */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollBy('left')}
          disabled={!canScrollLeft}
          className="absolute left-2 top-1/2 z-20 hidden size-10 -translate-y-1/2 rounded-full border-stone-200 bg-white/90 shadow-elevated-3 backdrop-blur hover:bg-white disabled:pointer-events-none disabled:opacity-0 md:grid"
          aria-label="Geser ke kiri"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => scrollBy('right')}
          disabled={!canScrollRight}
          className="absolute right-2 top-1/2 z-20 hidden size-10 -translate-y-1/2 rounded-full border-stone-200 bg-white/90 shadow-elevated-3 backdrop-blur hover:bg-white disabled:pointer-events-none disabled:opacity-0 md:grid"
          aria-label="Geser ke kanan"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>

      {/* Scroll hint + count */}
      <div className="mt-4 flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-xs text-stone-500">
          <span className="hidden sm:inline">Geser atau gunakan panah untuk melihat lebih banyak</span>
          <span className="sm:hidden">Geser ke samping untuk melihat lebih banyak</span>
        </p>
        <span className="font-mono text-xs tabular-nums text-stone-400">
          {total} foto
        </span>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-sage-950/95 p-4 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Lightbox galeri"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-elevated-5 sm:aspect-[16/10]">
                <GaleriMedia
                  item={galeri[lightbox]}
                  index={lightbox}
                  className="size-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6">
                  <p className="font-display text-lg font-medium text-white text-balance">
                    {galeri[lightbox].judul}
                  </p>
                </div>
              </div>

              {/* Nav arrows */}
              {total > 1 && (
                <>
                  <button
                    onClick={() =>
                      setLightbox((i) =>
                        i !== null ? (i - 1 + total) % total : null
                      )
                    }
                    className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 grid size-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
                    aria-label="Foto sebelumnya"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={() =>
                      setLightbox((i) =>
                        i !== null ? (i + 1) % total : null
                      )
                    }
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 grid size-12 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
                    aria-label="Foto berikutnya"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}

              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-12 right-0 grid size-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
                aria-label="Tutup"
              >
                <X className="size-5" />
              </button>

              <p className="mt-4 text-center font-mono text-sm tabular-nums text-stone-300">
                {lightbox + 1} / {total}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  )
}
