import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Crumb {
  label: string
  href?: string
}

interface Props {
  title: string
  subtitle?: string
  breadcrumbs: Crumb[]
  children?: React.ReactNode
  className?: string
  /**
   * Visual variant:
   * - `editorial`  : stone-50 + motif topo + heading besar Fraunces (default, paling versatile)
   * - `light`      : white bersih tanpa motif, untuk halaman administratif
   * - `gradient`   : sage-800 dramatic dengan grain, untuk halaman impact
   * - `minimal`    : sangat tipis, hanya breadcrumb + title, untuk section page
   */
  variant?: 'editorial' | 'light' | 'gradient' | 'minimal'
  /** Pattern dekoratif overlay (hanya untuk editorial & gradient) */
  pattern?: 'none' | 'topo' | 'grain'
  /** Lebar konten di dalam header */
  size?: 'narrow' | 'default' | 'wide'
  /** Override container width */
  fullBleed?: boolean
}

const sizeMap = {
  narrow: 'max-w-3xl',
  default: 'max-w-4xl',
  wide: 'max-w-6xl',
} as const

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  children,
  className,
  variant = 'editorial',
  pattern = 'topo',
  size = 'default',
  fullBleed = false,
}: Props) {
  const isDark = variant === 'gradient'

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        variant === 'editorial' && 'bg-stone-50',
        variant === 'light' && 'bg-white',
        variant === 'gradient' && 'bg-sage-800 text-stone-50',
        variant === 'minimal' && 'bg-white',
        className
      )}
    >
      {/* Pattern overlay */}
      {pattern !== 'none' && (
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0',
            pattern === 'topo' && 'bg-topo',
            pattern === 'grain' && 'bg-grain',
            !isDark && 'opacity-60',
            isDark && 'opacity-25'
          )}
        />
      )}

      {/* Gradient variant: extra glow */}
      {variant === 'gradient' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sage-700 via-sage-800 to-sage-900"
        />
      )}

      <div
        className={cn(
          'relative',
          fullBleed
            ? 'px-5 sm:px-6 md:px-8 lg:px-10'
            : cn('mx-auto w-full', sizeMap[size], 'px-5 sm:px-6 md:px-8'),
          // Spacing
          variant === 'minimal' ? 'pt-24 pb-6 md:pt-28 md:pb-8' : 'pt-28 pb-12 md:pt-32 md:pb-16'
        )}
      >
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className={cn(
              'mb-5 flex flex-wrap items-center gap-1.5 text-sm',
              isDark ? 'text-stone-300' : 'text-stone-500'
            )}
          >
            {breadcrumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {c.href ? (
                  <Link
                    href={c.href}
                    className={cn(
                      'transition-colors',
                      isDark ? 'hover:text-white' : 'hover:text-sage-700'
                    )}
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span
                    className={cn(isDark ? 'text-white' : 'text-stone-800')}
                    aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
                  >
                    {c.label}
                  </span>
                )}
                {i < breadcrumbs.length - 1 && (
                  <ChevronRight
                    className={cn(
                      'size-3.5 opacity-60',
                      isDark ? 'text-stone-400' : 'text-stone-400'
                    )}
                  />
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1
          className={cn(
            'font-display font-medium tracking-tight text-balance',
            variant === 'editorial' && 'text-4xl md:text-5xl lg:text-6xl text-stone-800',
            variant === 'light' && 'text-3xl md:text-4xl text-stone-800',
            variant === 'gradient' && 'text-4xl md:text-5xl lg:text-6xl text-white',
            variant === 'minimal' && 'text-2xl md:text-3xl text-stone-800'
          )}
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className={cn(
              'mt-3 max-w-2xl leading-relaxed',
              variant === 'minimal' ? 'text-sm' : 'text-base md:text-lg',
              isDark ? 'text-stone-300' : 'text-stone-600'
            )}
          >
            {subtitle}
          </p>
        )}

        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  )
}
