'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function PageWrapper({ children, className }: Props) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      // P1-C3: opacity-only (tanpa geser y) + durasi pendek — konten tak
      // bergeser (nol kontribusi CLS) dan LCP terukur lebih cepat.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
