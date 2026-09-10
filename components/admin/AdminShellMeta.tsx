import AdminSidebar from '@/components/admin/AdminSidebar'
import { getProfilDesa, getPesanBelumDibaca } from '@/lib/cache'

/**
 * F2 (T-20) — meta sidebar yang streaming.
 *
 * Sebelumnya `layout.tsx` meng-`await` 2 query (nama desa + count
 * unread) SEBELUM `children` render → tiap navigasi `/admin/*` bayar
 * 2 RTT pooler dulu. Sekarang fetch pindah ke sini dan layout membungkus
 * dengan `<Suspense>`: shell + halaman jalan duluan, sidebar terisi
 * menyusul. `nama_desa` ter-cache 3600s (tag `profil`),
 * unread ter-cache 15s (tag `pesan`).
 */
export async function AdminSidebarWithMeta() {
  const [profil, pesanBelumDibaca] = await Promise.all([getProfilDesa(), getPesanBelumDibaca()])

  return (
    <AdminSidebar
      namaDesa={profil?.nama_desa ?? 'Desa Sukobubuk'}
      logoUrl="/images/logo-desa.webp"
      unreadCount={pesanBelumDibaca}
    />
  )
}

/**
 * Placeholder selagi meta dimuat — selebar sidebar collapsed
 * (`DesktopSidebar` default `w-[68px]`), hanya desktop. Mobile memakai
 * overlay on-demand sehingga tidak butuh skeleton.
 */
export function AdminSidebarSkeleton() {
  return <div className="hidden h-screen w-[68px] shrink-0 animate-pulse bg-sage-900 lg:block" aria-hidden />
}
