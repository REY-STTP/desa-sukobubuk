import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminLiveRefreshLazy from './_lazy-admin-refresh'
import SessionProvider from '@/components/admin/SessionProvider'
import { SidebarProvider } from '@/components/admin/SidebarContext'
import { AdminSidebarWithMeta, AdminSidebarSkeleton } from '@/components/admin/AdminShellMeta'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Gate sesi TETAP di sini, sebelum Suspense: keputusan redirect harus
  // final sebelum streaming apa pun (jangan pindah ke dalam Suspense).
  const session = await auth()
  if (!session) redirect('/admin/login')

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-stone-50">
          {/* F2 (T-20): meta sidebar streaming — shell + children tidak
              menunggu query nama desa / count unread. */}
          <Suspense fallback={<AdminSidebarSkeleton />}>
            <AdminSidebarWithMeta />
          </Suspense>
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <AdminHeader />
            <AdminLiveRefreshLazy />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SessionProvider>
  )
}
