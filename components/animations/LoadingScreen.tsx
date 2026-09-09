'use client'

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useLoading } from '@/lib/loading-context'

interface Props {
  namaDesa?: string
  logoUrl?: string | null
  namaKecamatan?: string
  namaKabupaten?: string
}

// Minimum visible time so the loader is not a flash, plus a safety cap
// so it never blocks forever if a navigation silently fails.
// P1-C3: loader hanya muncul bila navigasi lambat (SHOW_DELAY_MS) agar
// navigasi cepat tak tertutup overlay; MIN dipangkas 350 → 150ms.
const MIN_VISIBLE_MS = 150
const MAX_DURATION_MS = 1400
const SHOW_DELAY_MS = 250

// Cache "sudah pernah tampil" per sesi tab: sekali loader tampil penuh di
// "/", navigasi/reload berikutnya dalam tab yang sama tak tampil lagi.
const SHOWN_KEY = 'sukobubuk:loader-shown'

function hasSeenLoader(): boolean {
  try {
    return typeof window !== 'undefined' && window.sessionStorage.getItem(SHOWN_KEY) === '1'
  } catch {
    return false
  }
}

function markLoaderSeen(): void {
  try {
    window.sessionStorage.setItem(SHOWN_KEY, '1')
  } catch {
    // Abaikan (mode privat dsb.) — loader tampil normal tiap kunjungan.
  }
}

export default function LoadingScreen({
  namaDesa = 'Desa Sukobubuk',
  logoUrl = null,
  namaKecamatan = 'Kec. Margorejo',
  namaKabupaten = 'Kab. Pati',
}: Props) {
  const pathname = usePathname()
  const [show, setShow] = useState(true)
  // DEPS-004 / Phase 06 — derive `hydrated` from a ref so the effect body
  // can avoid synchronous setState. Wrapping the actual setState in a
  // queueMicrotask satisfies the `react-hooks/set-state-in-effect` rule.
  const hydratedRef = useRef(false)
  const [hydrated, setHydrated] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const { setIsLoading } = useLoading()

  // Sync loading state to LoadingContext so <main aria-busy> updates (A11Y-003)
  useEffect(() => {
    setIsLoading(show)
  }, [show, setIsLoading])

  // Mark the loader as hydrated on first mount so we can show it again
  // on subsequent navigations.
  useEffect(() => {
    if (hydratedRef.current) return
    hydratedRef.current = true
    queueMicrotask(() => setHydrated(true))
  }, [])

  // Initial mount: hide after the progress animation finishes (not a fixed
  // 1.4s on every navigation). Loader HANYA untuk "/" — navigasi ke halaman
  // lain tak memicu overlay (lihat guard pathname di bawah).
  useEffect(() => {
    if (!hydrated) return
    // Do not re-show on *initial* hydration — the initial show is already
    // true from useState(true). Only handle *subsequent* pathname changes.
    if (pathname === null) return
    // Hanya "/" yang boleh menampilkan loader. Masuk halaman lain (awal
    // maupun navigasi) → pastikan sembunyi, tanpa timer/show.
    if (pathname !== '/') {
      queueMicrotask(() => setShow(false))
      return
    }
    // Sudah pernah tampil di sesi tab ini → jangan tampil lagi.
    if (hasSeenLoader()) {
      queueMicrotask(() => setShow(false))
      return
    }
    markLoaderSeen()
    // P1-C3: tunda tampil — navigasi cepat (< SHOW_DELAY_MS) selesai tanpa
    // overlay sama sekali. Initial mount tak terpengaruh (show sudah true).
    let showTimer: ReturnType<typeof setTimeout> | 0 = 0
    showTimer = setTimeout(() => setShow(true), SHOW_DELAY_MS)
    const start = Date.now()
    // Use requestAnimationFrame to detect when the browser has painted the
    // destination page. As soon as the next frame fires and at least
    // MIN_VISIBLE_MS has elapsed, hide the loader. MAX_DURATION_MS is the
    // hard safety cap.
    let raf1 = 0
    let raf2 = 0
    let hideTimer: ReturnType<typeof setTimeout> | 0 = 0
    const scheduleHide = () => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)
      hideTimer = setTimeout(() => setShow(false), remaining)
    }
    // Defer to next frame so the destination route has a chance to commit.
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        scheduleHide()
      })
    })
    const safety = setTimeout(() => setShow(false), MAX_DURATION_MS)
    return () => {
      if (showTimer) clearTimeout(showTimer)
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      if (hideTimer) clearTimeout(hideTimer)
      clearTimeout(safety)
    }
  }, [pathname, hydrated])

  const initial = namaDesa
    .split(' ')
    .find((w) => w.length > 2 && w.toLowerCase() !== 'desa')?.[0]
    ?.toUpperCase() ?? namaDesa[0]

  // Render null pra-hidrasi: cegah flash loader + hydration mismatch saat
  // entry point BUKAN "/" (efek di atas memutuskan tampil/tidak pasca-mount).
  if (!hydrated) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          initial={shouldReduceMotion ? false : { opacity: 1 }}
          exit={
            shouldReduceMotion
              ? { opacity: 0, transition: { duration: 0 } }
              : { opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } }
          }
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
            initial={shouldReduceMotion ? false : { scale: 0.92, opacity: 0 }}
            animate={shouldReduceMotion ? {} : { scale: 1, opacity: 1 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' as const }}
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
                />
              ) : (
                <span className="font-display text-3xl font-medium text-white">
                  {initial}
                </span>
              )}
            </div>

            <div className="text-center">
              <motion.h1
                initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.2, duration: 0.4 }}
                className="font-display text-lg font-medium text-stone-800"
              >
                {namaDesa}
              </motion.h1>
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0 }}
                animate={shouldReduceMotion ? {} : { opacity: 1 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: 0.35, duration: 0.4 }}
                className="mt-0.5 text-xs text-stone-500"
              >
                {namaKecamatan}, {namaKabupaten}
              </motion.p>
            </div>

            {/* Progress bar — slim, refined */}
            <div
              aria-hidden
              className="h-0.5 w-44 overflow-hidden rounded-full bg-stone-200"
            >
              {shouldReduceMotion ? (
                <div className="h-full w-full rounded-full bg-sage-600" />
              ) : (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.25, duration: 0.95, ease: 'easeInOut' }}
                  className="h-full rounded-full bg-sage-600"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
