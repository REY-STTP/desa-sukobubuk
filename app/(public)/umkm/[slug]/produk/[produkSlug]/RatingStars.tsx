'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// TASK-REV-01 — bintang rating. Dua mode:
// - display: read-only (agregat, kartu ulasan)
// - input: radiogroup keyboard-accessible untuk form (panah/angka tidak
//   di-override; tiap bintang adalah radio button native yang di-style).
// Ikon lucide Star (fill-amber-400 terisi, text-stone-300 kosong) —
// konsisten dengan tone repo; belum ada komponen rating di components/ui.

interface DisplayProps {
  mode?: 'display'
  value: number
  className?: string
  starClass?: string
}

interface InputProps {
  mode: 'input'
  value: number
  onChange: (v: number) => void
  disabled?: boolean
  className?: string
  starClass?: string
}

type Props = DisplayProps | InputProps

export default function RatingStars(props: Props) {
  const { value, className, starClass } = props
  const [hover, setHover] = useState(0)
  const shown = props.mode === 'input' && hover > 0 ? hover : value

  if (props.mode === 'input') {
    const { onChange, disabled } = props
    return (
      <div
        role="radiogroup"
        aria-label="Rating"
        className={cn('inline-flex items-center gap-1', className)}
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((v) => (
          <label
            key={v}
            className={cn(
              'cursor-pointer rounded-md p-0.5 transition-transform hover:scale-110 focus-within:ring-2 focus-within:ring-sage-500/40',
              disabled && 'pointer-events-none opacity-60'
            )}
            onMouseEnter={() => setHover(v)}
          >
            <input
              type="radio"
              name="rating"
              value={v}
              checked={value === v}
              disabled={disabled}
              onChange={() => onChange(v)}
              className="sr-only"
              aria-label={`${v} dari 5 bintang`}
            />
            <Star
              aria-hidden
              className={cn(
                'size-7 transition-colors',
                v <= shown ? 'fill-amber-400 text-amber-400' : 'fill-stone-100 text-stone-300',
                starClass
              )}
            />
          </label>
        ))}
      </div>
    )
  }

  return (
    <span
      role="img"
      aria-label={`Rating ${value} dari 5`}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {[1, 2, 3, 4, 5].map((v) => (
        <Star
          key={v}
          aria-hidden
          className={cn(
            'size-4',
            v <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-stone-100 text-stone-300',
            starClass
          )}
        />
      ))}
    </span>
  )
}
