'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * P1-U2: tombol "kembali" tanpa URL `javascript:` (tidak valid di
 * next/link, bisa diblokir CSP, mati tanpa JS bermakna). Memakai
 * `router.back()`; tanpa riwayat, fallback ke `/`.
 */
export default function BackButton({
  label = 'Halaman sebelumnya',
  className,
  variant = 'ghost',
  size = 'sm',
}: {
  label?: string
  className?: string
  variant?: 'ghost' | 'outline'
  size?: 'sm' | 'lg'
}) {
  const router = useRouter()
  return (
    <Button
      variant={variant}
      size={size}
      className={cn('text-stone-500 hover:bg-stone-100', className)}
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back()
        } else {
          router.push('/')
        }
      }}
    >
      <ArrowLeft className="size-4" data-icon="inline-start" />
      {label}
    </Button>
  )
}
