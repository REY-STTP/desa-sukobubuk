'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Global live refresh untuk semua halaman admin.
 * - Polling router.refresh() tiap 10s → list berita/umkm/produk/pesan/dll ter-update tanpa F5
 * - Instant refresh saat ada CRUD (event admin:mutated dari form/delete)
 * - Refresh saat tab kembali fokus
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
