'use client'

/**
 * F-310 / PERF-005 — lazy-loaded wrapper for AdminLiveRefresh.
 *
 * AdminLiveRefresh subscribes to a window 'focus' and 'pageshow' event
 * and re-fetches the dashboard data when the user returns. Defer it
 * so the admin layout renders immediately and the polling/focus
 * subscription is added once the chunk arrives.
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
