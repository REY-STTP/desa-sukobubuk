import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  className?: string
}

/**
 * F2-FaseP1 / T-P12 — fade-in halaman via CSS, 0 byte JS.
 *
 * Sebelumnya `use client` + framer-motion hanya demi `opacity` 250ms di
 * 10 route (puluhan KB gzip). `animate-page-fade` (lihat `globals.css`)
 * identik secara visual (opacity 0→1, 0.25s, ease-out) dan global
 * `prefers-reduced-motion` menonaktifkannya otomatis.
 */
export default function PageWrapper({ children, className }: Props) {
  return <div className={cn('animate-page-fade', className)}>{children}</div>
}
