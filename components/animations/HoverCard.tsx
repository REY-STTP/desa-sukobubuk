'use client'

import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
  scale?: number
  lift?: number
}

export default function HoverCard({ children, className, scale = 1.02, lift = 6 }: Props) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale,
        y: -lift,
        transition: { duration: 0.25, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  )
}
