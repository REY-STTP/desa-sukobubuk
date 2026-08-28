import * as React from 'react'
import { cn } from '@/lib/utils'

interface StackProps extends React.ComponentProps<'div'> {
  /** Arah susunan */
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  /** Jarak antar anak */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  /** Alignment cross-axis */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  /** Justify main-axis */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  /** Wrap behavior */
  wrap?: boolean
}

const gapMap = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-10',
  '3xl': 'gap-12 md:gap-16',
} as const

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
} as const

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
} as const

/**
 * Stack — flex container sederhana untuk vertical/horizontal stack
 * dengan kontrol gap, alignment, dan justify yang konsisten.
 *
 * Alternatif ringan dari `space-y-*` yang lebih eksplisit dan
 * mudah di-compose dengan responsif.
 */
export function Stack({
  direction = 'col',
  gap = 'md',
  align,
  justify,
  wrap = false,
  className,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'col' && 'flex-col',
        direction === 'row' && 'flex-row',
        direction === 'col-reverse' && 'flex-col-reverse',
        direction === 'row-reverse' && 'flex-row-reverse',
        gapMap[gap],
        align && alignMap[align],
        justify && justifyMap[justify],
        wrap && 'flex-wrap',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
