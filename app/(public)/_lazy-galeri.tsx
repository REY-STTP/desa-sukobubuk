'use client'

/**
 * F-310 / PERF-005 — lazy-loaded wrapper for the heavy GaleriSection.
 *
 * GaleriSection uses framer-motion (AnimatePresence for the lightbox) +
 * the @/components/ui/button and other Radix primitives, which together
 * add up to ~30 KB gzipped. Lazy-loading it on the home page means the
 * JS doesn't load until the gallery scrolls into view (or the home page
 * is otherwise idle).
 *
 * Defer strategy: render a small placeholder (with the same height
 * skeleton as the real section) so the layout doesn't shift.
 */
import dynamic from 'next/dynamic'

const GaleriSection = dynamic(
  () => import('@/components/sections/GaleriSection').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      // P3-I3: tinggi meniru seksi riil (header ±130 + kartu 220/260/300 +
      // hint ±40) agar CLS ≈ 0 saat hydrate.
      <div
        className="flex min-h-[400px] items-center justify-center bg-stone-50 sm:min-h-[440px] md:min-h-[480px]"
        role="status"
        aria-label="Memuat galeri"
      >
        <div className="size-10 animate-pulse rounded-full bg-stone-200" />
      </div>
    ),
  }
)

interface Item {
  id: number
  judul: string
  foto: string | null
  created_at: Date
}

export default function GaleriSectionLazy({ galeri }: { galeri: Item[] }) {
  return <GaleriSection galeri={galeri as never} />
}
