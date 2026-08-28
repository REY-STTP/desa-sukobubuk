'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Props {
  namaDesa?: string
  logoUrl?: string | null
  namaKecamatan?: string
  namaKabupaten?: string
}

export default function LoadingScreen({
  namaDesa = 'Desa Sukobubuk',
  logoUrl = null,
  namaKecamatan = 'Kec. Margorejo',
  namaKabupaten = 'Kab. Pati',
}: Props) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Durasi maks 1.4s (≤ 1.5s sesuai gate Tahap 2)
    const timer = setTimeout(() => setShow(false), 1400)
    return () => clearTimeout(timer)
  }, [])

  const initial = namaDesa
    .split(' ')
    .find((w) => w.length > 2 && w.toLowerCase() !== 'desa')?.[0]
    ?.toUpperCase() ?? namaDesa[0]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-stone-50"
          role="status"
          aria-live="polite"
          aria-label={`Memuat ${namaDesa}`}
        >
          {/* Subtle grain background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grain opacity-30"
          />

          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="relative flex flex-col items-center gap-5"
          >
            {/* Logo */}
            <div className="grid size-20 place-items-center overflow-hidden rounded-2xl bg-sage-600 shadow-elevated-3 ring-1 ring-sage-700/30">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={namaDesa}
                  width={80}
                  height={80}
                  className="size-full object-contain"
                  unoptimized
                />
              ) : (
                <span className="font-display text-3xl font-medium text-white">
                  {initial}
                </span>
              )}
            </div>

            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="font-display text-lg font-medium text-stone-800"
              >
                {namaDesa}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.4 }}
                className="mt-0.5 text-xs text-stone-500"
              >
                {namaKecamatan}, {namaKabupaten}
              </motion.p>
            </div>

            {/* Progress bar — slim, refined */}
            <motion.div
              aria-hidden
              className="h-0.5 w-44 overflow-hidden rounded-full bg-stone-200"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.25, duration: 0.95, ease: 'easeInOut' }}
                className="h-full rounded-full bg-sage-600"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
