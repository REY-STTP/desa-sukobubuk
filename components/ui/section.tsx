import * as React from 'react'
import { cn } from '@/lib/utils'

interface SectionProps extends React.ComponentProps<'section'> {
  /** Variant visual section */
  variant?: 'default' | 'subtle' | 'elevated' | 'dark'
  /** Padding vertical */
  spacing?: 'tight' | 'default' | 'loose' | 'none'
  /** Pattern dekoratif overlay */
  pattern?: 'none' | 'grain' | 'topo' | 'grid'
  /** Lebar konten (default wide) */
  size?: 'prose' | 'narrow' | 'default' | 'wide' | 'fluid'
  /** Id untuk anchor / skip-to-content */
  id?: string
}

const variantMap = {
  default: 'bg-background',
  subtle: 'bg-stone-50',
  elevated: 'bg-white',
  dark: 'bg-sage-800 text-stone-50',
} as const

const spacingMap = {
  none: 'py-0',
  tight: 'py-10 md:py-16',
  default: 'py-16 md:py-24',
  loose: 'py-20 md:py-32',
} as const

const patternMap = {
  none: '',
  grain: 'bg-grain',
  topo: 'bg-topo',
  grid: 'bg-grid',
} as const

const sizeMap = {
  prose: 'max-w-[65ch]',
  narrow: 'max-w-[768px]',
  default: 'max-w-[1024px]',
  wide: 'max-w-[1200px]',
  fluid: 'max-w-none',
} as const

/**
 * Section adalah wrapper standar untuk section halaman dengan
 * konsistensi padding, background, dan pattern dekoratif.
 *
 * - `variant` : tone visual (default, subtle, elevated, dark)
 * - `spacing` : vertical padding (none/tight/default/loose)
 * - `pattern` : motif dekoratif overlay (grain/topo/grid)
 * - `size`    : lebar konten via Container di dalam
 */
export function Section({
  variant = 'default',
  spacing = 'default',
  pattern = 'none',
  size = 'wide',
  className,
  children,
  id,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative w-full overflow-hidden',
        variantMap[variant],
        spacingMap[spacing],
        patternMap[pattern],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'mx-auto w-full px-5 sm:px-6 md:px-8 lg:px-10',
          sizeMap[size]
        )}
      >
        {children}
      </div>
    </section>
  )
}

/** Header section reusable — eyebrow, heading, subtitle, action */
interface SectionHeaderProps extends React.ComponentProps<'div'> {
  eyebrow?: React.ReactNode
  heading?: React.ReactNode
  subtitle?: React.ReactNode
  align?: 'left' | 'center'
  action?: React.ReactNode
}

export function SectionHeader({
  eyebrow,
  heading,
  subtitle,
  align = 'left',
  action,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-10 md:mb-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'md:flex-col md:items-center md:text-center',
        className
      )}
      {...props}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && <div className="section-eyebrow mb-3">{eyebrow}</div>}
        {heading && <h2 className="section-title">{heading}</h2>}
        {subtitle && <p className="section-subtitle mt-3">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
