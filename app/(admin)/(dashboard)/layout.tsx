import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminLiveRefresh from '@/components/admin/AdminLiveRefresh'
import SessionProvider from '@/components/admin/SessionProvider'
import { SidebarProvider } from '@/components/admin/SidebarContext'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const [profil, pesanBelumDibaca] = await Promise.all([
    prisma.profilDesa.findFirst({
      select: { nama_desa: true },
    }),
    prisma.pesan.count({ where: { is_read: false } }),
  ])

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-stone-50">
          <AdminSidebar
            namaDesa={profil?.nama_desa ?? 'Desa Sukobubuk'}
            logoUrl="/images/logo-desa.png"
            unreadCount={pesanBelumDibaca}
          />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <AdminHeader />
            <AdminLiveRefresh />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SessionProvider>
  )
}
