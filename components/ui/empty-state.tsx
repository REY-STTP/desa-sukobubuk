import * as React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps extends React.ComponentProps<'div'> {
  /** Icon (biasanya dari lucide-react) */
  icon?: React.ReactNode
  /** Judul empty state */
  title: string
  /** Deskripsi singkat */
  description?: string
  /** CTA / action utama */
  action?: React.ReactNode
  /** Tone warna icon background */
  tone?: 'sage' | 'ember' | 'stone'
  /** Ukuran kontainer */
  size?: 'sm' | 'md' | 'lg'
}

const toneMap = {
  sage: 'bg-sage-100 text-sage-700',
  ember: 'bg-ember-100 text-ember-700',
  stone: 'bg-stone-200 text-stone-600',
} as const

const sizeMap = {
  sm: { wrap: 'py-10', iconWrap: 'size-12', icon: 'size-5', title: 'text-base' },
  md: { wrap: 'py-16', iconWrap: 'size-16', icon: 'size-6', title: 'text-lg' },
  lg: { wrap: 'py-20', iconWrap: 'size-20', icon: 'size-8', title: 'text-xl' },
} as const

/**
 * EmptyState — state ketika list/konten kosong.
 * BUKAN cuma "icon + text", tapi ada ilustrasi tone, deskripsi jelas, dan CTA.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'stone',
  size = 'md',
  className,
  ...props
}: EmptyStateProps) {
  const s = sizeMap[size]
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center text-center',
        s.wrap,
        className
      )}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            'mb-5 grid place-items-center rounded-2xl ring-1 ring-inset ring-stone-200',
            s.iconWrap,
            toneMap[tone]
          )}
        >
          <span className={s.icon}>{icon}</span>
        </div>
      )}
      <h3 className={cn('font-display font-medium text-stone-800', s.title)}>
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-stone-500 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
