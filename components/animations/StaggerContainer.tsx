'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  once?: boolean
}

const containerVariants = (staggerDelay: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
})

export const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export default function StaggerContainer({ children, className, staggerDelay = 0.1, once = true }: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      variants={containerVariants(staggerDelay)}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}
