import * as React from 'react'
import { cn } from '@/lib/utils'

interface StatTileProps extends React.ComponentProps<'div'> {
  /** Icon component dari lucide-react (atau element lain) */
  icon?: React.ReactNode
  /** Tone warna icon background */
  tone?: 'sage' | 'ember' | 'stone' | 'muted'
  /** Variant card */
  variant?: 'default' | 'outlined' | 'subtle'
  /** Ukuran tile */
  size?: 'sm' | 'md' | 'lg'
}

const toneMap = {
  sage: 'bg-sage-100 text-sage-700 ring-sage-200',
  ember: 'bg-ember-100 text-ember-700 ring-ember-200',
  stone: 'bg-stone-200 text-stone-700 ring-stone-300',
  muted: 'bg-stone-100 text-stone-600 ring-stone-200',
} as const

const variantMap = {
  default: 'bg-stone-50 ring-1 ring-stone-200/60',
  outlined: 'bg-white ring-1 ring-stone-200',
  subtle: 'bg-transparent ring-0',
} as const

const sizeMap = {
  sm: { tile: 'gap-3 p-3', icon: 'size-9', number: 'text-lg', label: 'text-xs' },
  md: { tile: 'gap-4 p-5', icon: 'size-11', number: 'text-2xl', label: 'text-sm' },
  lg: { tile: 'gap-5 p-6', icon: 'size-14', number: 'text-3xl md:text-4xl', label: 'text-sm' },
} as const

/**
 * StatTile — kartu untuk angka/data penting dengan icon.
 * Cocok untuk: statistik desa, jumlah UMKM, produk, penduduk, dll.
 */
export function StatTile({
  icon,
  tone = 'sage',
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props
}: StatTileProps) {
  const s = sizeMap[size]
  return (
    <div
      className={cn(
        'flex items-start rounded-2xl transition-shadow hover:shadow-elevated-3',
        variantMap[variant],
        s.tile,
        className
      )}
      {...props}
    >
      {icon && (
        <div
          className={cn(
            'shrink-0 grid place-items-center rounded-xl ring-1 ring-inset',
            s.icon,
            toneMap[tone]
          )}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

interface StatNumberProps extends React.ComponentProps<'p'> {
  prefix?: string
  suffix?: string
}

export function StatNumber({
  prefix,
  suffix,
  className,
  children,
  ...props
}: StatNumberProps) {
  return (
    <p
      className={cn(
        'font-mono font-medium tabular-nums text-stone-800 leading-none',
        className
      )}
      {...props}
    >
      {prefix}
      {children}
      {suffix}
    </p>
  )
}

export function StatLabel({ className, children, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-stone-500 mt-1.5 leading-snug', className)}
      {...props}
    >
      {children}
    </p>
  )
}
