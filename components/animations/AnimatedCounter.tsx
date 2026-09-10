'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  suffix?: string
  prefix?: string
  duration?: number
  format?: boolean
}

/**
 * F2-FaseP1 / T-P12 — count-up tanpa framer-motion.
 *
 * Sebelumnya `useSpring + useTransform + useMotionValue` (≈ engine fisika
 * untuk menganimasikan 3–4 angka). Pengganti: `rAF` + easing `easeOutCubic`
 * + `Intl.NumberFormat('id-ID')` — API props dan format output identik,
 * termasuk nilai final langsung saat `prefers-reduced-motion` dan start
 * sekali saat masuk viewport (`IntersectionObserver once`).
 */
function formatNum(n: number, prefix: string, suffix: string, format: boolean): string {
  const num = Math.round(n)
  const text = format ? num.toLocaleString('id-ID') : String(num)
  return `${prefix}${text}${suffix}`
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function AnimatedCounter({ value, suffix = '', prefix = '', duration = 1.5, format = true }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const [reduced, setReduced] = useState<boolean>(prefersReducedMotion)
  const [text, setText] = useState(() => formatNum(0, prefix, suffix, format))
  const instant = reduced || duration <= 0

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || instant) return
    let raf = 0
    let started = false
    let cancelled = false
    const totalMs = duration * 1000
    const tick = (t0: number) => (now: number) => {
      if (cancelled) return
      const p = Math.min(1, (now - t0) / totalMs)
      const eased = 1 - Math.pow(1 - p, 3)
      setText(formatNum(value * eased, prefix, suffix, format))
      if (p < 1) raf = requestAnimationFrame(tick(t0))
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !started) {
          started = true
          io.disconnect()
          raf = requestAnimationFrame(tick(performance.now()))
        }
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [value, prefix, suffix, duration, format, instant])

  return <span ref={ref}>{instant ? formatNum(value, prefix, suffix, format) : text}</span>
}
