'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Global live refresh untuk semua halaman admin — PEMILIK TUNGGAL refresh.
 *
 * F1 (T-10): sebelumnya `DashboardLive` (khusus `/admin`) memasang
 * listener yang sama + polling `fetch /api/admin/stats` tiap 30s,
 * sehingga 1 event = 2x `router.refresh()` + 1x fetch. Sekarang
 * `DashboardLive` pasif (sinkron via prop RSC), dan komponen ini
 * satu-satunya yang memanggil `router.refresh()`:
 * - Instant refresh saat ada CRUD (event admin:mutated dari form/delete)
 * - Refresh saat tab kembali fokus / terlihat
 * Throttle 2s agar event beruntun tidak menumpuk RSC refetch.
 */
export default function AdminLiveRefresh() {
  const router = useRouter()
  const lastRefresh = useRef(0)

  const refresh = useCallback(() => {
    const now = Date.now()
    if (now - lastRefresh.current < 2000) return
    lastRefresh.current = now
    router.refresh()
  }, [router])

  useEffect(() => {
    const onMutated = () => refresh()
    const onFocus = () => refresh()
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    window.addEventListener('admin:mutated' as any, onMutated)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.removeEventListener('admin:mutated' as any, onMutated)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refresh])

  return null
}
