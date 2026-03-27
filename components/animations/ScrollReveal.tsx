'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
  once?: boolean
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.6,
  once = true,
}: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-80px' })

  const directionOffset = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
    none: { y: 0, x: 0 },
  }

  const initial = { opacity: 0, ...directionOffset[direction] }
  const animate = isInView ? { opacity: 1, y: 0, x: 0 } : initial

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration, delay, ease: 'easeOut' as const }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
