import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Pengaturan Akun' }

// Lazy load form — hanya dibutuhkan saat user scroll ke bawah atau berinteraksi
const PengaturanForm = dynamic(() => import('./PengaturanForm'), {
  loading: () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-4">
      <div className="h-5 w-40 bg-gray-100 rounded" />
      <div className="h-10 bg-gray-50 rounded-xl" />
      <div className="h-10 bg-gray-50 rounded-xl" />
      <div className="h-10 bg-gray-50 rounded-xl w-32 ml-auto" />
    </div>
  ),
})

export default async function PengaturanPage() {
  const session = await getServerSession(authOptions)
  const user = await prisma.user.findUnique({
    where: { email: session!.user.email },
    select: { id: true, name: true, email: true, role: true, created_at: true },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Pengaturan Akun</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola informasi dan keamanan akun admin Anda</p>
      </div>

      {/* Info akun */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center">
            <span className="text-white font-display font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-display font-bold text-gray-900 text-lg">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="badge badge-green mt-1 capitalize">{user?.role}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Bergabung sejak</p>
            <p className="font-semibold text-gray-700">
              {user?.created_at
                ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(user.created_at)
                : '-'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Role</p>
            <p className="font-semibold text-gray-700 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Form pengaturan — lazy loaded */}
      <PengaturanForm user={user!} />
    </div>
  )
}
