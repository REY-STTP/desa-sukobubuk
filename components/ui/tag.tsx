import * as React from 'react'
import { cn } from '@/lib/utils'

interface TagProps extends React.ComponentProps<'span'> {
  /** Tone warna tag */
  tone?: 'sage' | 'ember' | 'stone' | 'muted'
  /** Ukuran tag */
  size?: 'sm' | 'md'
  /** Icon di sebelah kiri label */
  icon?: React.ReactNode
  /** Dot indicator di sebelah kiri */
  dot?: boolean
}

const toneMap = {
  sage: 'bg-sage-100 text-sage-700 ring-sage-200',
  ember: 'bg-ember-100 text-ember-700 ring-ember-200',
  stone: 'bg-stone-200 text-stone-700 ring-stone-300',
  muted: 'bg-stone-100 text-stone-600 ring-stone-200',
} as const

const sizeMap = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
} as const

const dotColorMap = {
  sage: 'bg-sage-500',
  ember: 'bg-ember-500',
  stone: 'bg-stone-500',
  muted: 'bg-stone-400',
} as const

/**
 * Tag — badge 2-tone (bg + ring inset) untuk kategori, status, label.
 * Menggantikan `<Badge>` shadcn untuk konsistensi visual.
 */
export function Tag({
  tone = 'sage',
  size = 'md',
  icon,
  dot = false,
  className,
  children,
  ...props
}: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset',
        toneMap[tone],
        sizeMap[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          aria-hidden
          className={cn('size-1.5 rounded-full', dotColorMap[tone])}
        />
      )}
      {icon}
      {children}
    </span>
  )
}
