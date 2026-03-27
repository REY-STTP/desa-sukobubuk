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
    const timer = setTimeout(() => setShow(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  const initial = namaDesa
    .split(' ')
    .find(w => w.length > 2 && w.toLowerCase() !== 'desa')?.[0]
    ?.toUpperCase() ?? namaDesa[0]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
          className="fixed inset-0 z-[9999] bg-primary-950 flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' as const }}
            className="flex flex-col items-center gap-5"
          >
            {/* Logo */}
            <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-900 overflow-hidden">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={namaDesa}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-white font-display font-bold text-4xl">{initial}</span>
              )}
            </div>

            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="font-display text-2xl font-bold text-white"
              >
                {namaDesa}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="text-primary-400 text-sm mt-1"
              >
                {namaKecamatan}, {namaKabupaten}
              </motion.p>
            </div>

            {/* Progress bar */}
            <motion.div className="w-48 h-1 bg-primary-800 rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.4, duration: 1.1, ease: 'easeInOut' }}
                className="h-full bg-primary-400 rounded-full"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
