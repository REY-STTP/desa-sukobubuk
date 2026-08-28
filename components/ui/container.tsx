import * as React from 'react'
import { cn } from '@/lib/utils'

interface ContainerProps extends React.ComponentProps<'div'> {
  /** Lebar maksimal container */
  size?: 'prose' | 'narrow' | 'default' | 'wide' | 'fluid'
  /** Padding inline horizontal (default true, set false untuk full-bleed child) */
  padded?: boolean
}

const sizeMap = {
  prose: 'max-w-[65ch]',
  narrow: 'max-w-[768px]',
  default: 'max-w-[1024px]',
  wide: 'max-w-[1200px]',
  fluid: 'max-w-none',
} as const

/**
 * Container adalah wrapper standar untuk membatasi lebar konten
 * dan menambahkan padding horizontal yang responsif.
 *
 * - `prose`   : 65ch (~640px) — body artikel
 * - `narrow`  : 768px — halaman narasi
 * - `default` : 1024px — halaman dalam
 * - `wide`    : 1200px — landing sections (default)
 * - `fluid`   : 100% (tanpa max-width) — untuk edge-to-edge
 */
export function Container({
  size = 'wide',
  padded = true,
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        sizeMap[size],
        padded && 'px-5 sm:px-6 md:px-8 lg:px-10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
