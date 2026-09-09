import { PageSkeleton } from '@/components/ui/page-skeleton'

/**
 * P1-U4: skeleton rute publik — akhirnya memakai PageSkeleton yang sudah
 * ada (sebelumnya diklaim dipakai tapi tak ada file loading.tsx).
 */
export default function PublicLoading() {
  return <PageSkeleton label="Memuat halaman…" />
}
