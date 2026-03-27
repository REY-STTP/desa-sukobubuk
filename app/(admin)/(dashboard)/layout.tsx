import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import SessionProvider from '@/components/admin/SessionProvider'
import { SidebarProvider } from '@/components/admin/SidebarContext'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const profil = await prisma.profilDesa.findFirst({
    select: { nama_desa: true },
  })

  return (
    <SessionProvider session={session}>
      <SidebarProvider>
        <div className="min-h-screen bg-gray-50 flex">
          <AdminSidebar
            namaDesa={profil?.nama_desa ?? 'Desa Sukobubuk'}
            logoUrl="/images/logo-desa.png"
          />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader />
            <main className="flex-1 p-4 sm:p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SessionProvider>
  )
}