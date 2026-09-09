'use client'

/**
 * F-310 / PERF-005 — lazy-loaded wrapper for DashboardLive.
 *
 * DashboardLive runs a fetch-polling loop that updates the dashboard
 * every few seconds. The first paint of the dashboard does not need
 * the live updates immediately — render a static placeholder and stream
 * the live data in once the chunk arrives.
 */
import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const DashboardLive = dynamic(
  () => import('@/components/admin/DashboardLive').then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="status"
        aria-label="Memuat dasbor"
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-stone-100"
          />
        ))}
      </div>
    ),
  }
)

export default function DashboardLiveLazy(
  props: ComponentProps<typeof DashboardLive>
) {
  return <DashboardLive {...props} />
}
