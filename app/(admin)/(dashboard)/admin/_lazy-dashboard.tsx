'use client'

/**
 * F-310 / PERF-005 — lazy-loaded wrapper for DashboardLive.
 *
 * F1 (T-10/T-11): DashboardLive kini PASIF — ia hanya menyinkronkan
 * prop RSC `initialStats` ke state (tanpa fetch polling/interval).
 * Data baru datang via `router.refresh()` dari AdminLiveRefresh
 * (pemilik tunggal refresh) + `revalidateTag('dashboard')` saat mutasi.
 * Chunk tetap di-lazy agar first paint dasbor tidak menunggu JS ini.
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
