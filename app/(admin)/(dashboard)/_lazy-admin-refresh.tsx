'use client'

/**
 * F-310 / PERF-005 — lazy-loaded wrapper for AdminLiveRefresh.
 *
 * AdminLiveRefresh adalah pemilik tunggal `router.refresh()` di admin:
 * ia listen `admin:mutated` + `focus` + `visibilitychange` (throttle 2s).
 * Defer agar layout admin render dulu, subscription dipasang sesudah
 * chunk tiba.
 */
import dynamic from 'next/dynamic'

const AdminLiveRefresh = dynamic(
  () => import('@/components/admin/AdminLiveRefresh').then((m) => m.default),
  {
    ssr: false,
    loading: () => null,
  }
)

export default function AdminLiveRefreshLazy() {
  return <AdminLiveRefresh />
}
