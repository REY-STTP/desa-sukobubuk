'use client'

import { motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface Props {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  format?: boolean
}

export default function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 1.5,
  format = true
}: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  // P1-A3: angka final langsung, tanpa spring, saat prefers-reduced-motion.
  // (Semua hook tetap dipanggil di atas — early return hanya untuk render.)
  const shouldReduceMotion = useReducedMotion()

  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })

  const display = useTransform(spring, (v) => {
    const num = Math.round(v)
    const formatted = format ? num.toLocaleString('id-ID') : num
    return `${prefix}${formatted}${suffix}`
  })

  useEffect(() => {
    if (isInView) motionValue.set(value)
  }, [isInView, value, motionValue])

  if (shouldReduceMotion) {
    const num = Math.round(value)
    const formatted = format ? num.toLocaleString('id-ID') : num
    return <span ref={ref}>{`${prefix}${formatted}${suffix}`}</span>
  }

  return <motion.span ref={ref}>{display}</motion.span>
}