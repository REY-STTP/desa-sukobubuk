/**
 * Reusable page-level skeleton used by `loading.tsx` route segments.
 * Pure presentational, no client-side code.
 *
 * Varian disesuaikan bentuk halaman agar minim lompatan layout (CLS):
 * - "page": header halaman + blok konten (default).
 * - "list": header + grid kartu (listing berita/UMKM).
 * - "form": header + kartu form sempit terpusat (kontak).
 * Tinggi memakai svh agar pas di mobile (address bar) maupun desktop.
 */
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'page' | 'list' | 'form'

function HeaderShimmer() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 pt-28 sm:px-6 md:px-8 md:pt-32 md:pb-16" aria-hidden>
      <div className="h-2.5 w-28 animate-pulse rounded-full bg-sage-200" />
      <div className="mt-4 h-8 w-3/4 animate-pulse rounded-xl bg-stone-200 md:h-12 md:w-1/2" />
      <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded-lg bg-stone-100 md:w-2/3" />
    </div>
  )
}

function SpinnerMark() {
  return (
    <div className="relative" aria-hidden>
      <div className="size-14 animate-pulse rounded-2xl bg-sage-200" />
      <Sparkles className="absolute inset-0 m-auto size-5 text-sage-500" />
    </div>
  )
}

export function PageSkeleton({ label = 'Memuat…', variant = 'page' }: { label?: string; variant?: Variant }) {
  return (
    <div
      className={cn(
        'min-h-[70svh] md:min-h-[60vh]',
        variant === 'page' && 'flex flex-col'
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <HeaderShimmer />
      {variant === 'list' && (
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-5 px-5 pb-16 sm:grid-cols-2 sm:px-6 md:px-8 lg:grid-cols-3 lg:gap-6" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn('overflow-hidden rounded-2xl bg-white ring-1 ring-stone-200/60', i > 2 && 'hidden sm:block', i > 3 && 'sm:hidden lg:block')}>
              <div className="aspect-[16/10] animate-pulse bg-stone-100" />
              <div className="space-y-2.5 p-5">
                <div className="h-4 w-11/12 animate-pulse rounded-lg bg-stone-200" />
                <div className="h-4 w-2/3 animate-pulse rounded-lg bg-stone-100" />
                <div className="h-3 w-1/3 animate-pulse rounded-full bg-stone-100" />
              </div>
            </div>
          ))}
        </div>
      )}
      {variant === 'form' && (
        <div className="mx-auto w-full max-w-[768px] px-5 pb-16 sm:px-6 md:px-8" aria-hidden>
          <div className="rounded-2xl bg-white p-5 ring-1 ring-stone-200/60 md:p-8">
            <div className="h-10 animate-pulse rounded-xl bg-stone-100" />
            <div className="mt-4 h-10 animate-pulse rounded-xl bg-stone-100" />
            <div className="mt-4 h-32 animate-pulse rounded-xl bg-stone-100" />
            <div className="mt-5 h-11 w-36 animate-pulse rounded-xl bg-sage-200" />
          </div>
        </div>
      )}
      {variant === 'page' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 pb-16" aria-hidden>
          <SpinnerMark />
          <div className="space-y-2 text-center">
            <div className="mx-auto h-3 w-32 animate-pulse rounded-full bg-stone-200" />
            <div className="mx-auto h-2 w-20 animate-pulse rounded-full bg-stone-100" />
          </div>
        </div>
      )}
    </div>
  )
}
