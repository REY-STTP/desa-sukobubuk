'use client'

import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function PageWrapper({ children, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}