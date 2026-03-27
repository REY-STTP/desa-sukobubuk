'use client'

import { useSession } from 'next-auth/react'
import { Bell, User, Menu } from 'lucide-react'
import Link from 'next/link'
import { useSidebar } from './SidebarContext'

export default function AdminHeader() {
  const { data: session } = useSession()
  const { toggle } = useSidebar()

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — hanya muncul di mobile */}
        <button
          onClick={toggle}
          className="lg:hidden w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-4 h-4 text-gray-600" />
        </button>

        <div>
          <p className="text-xs text-gray-400">Selamat datang kembali,</p>
          <p className="font-semibold text-gray-900">{session?.user?.name ?? 'Admin'}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/pesan"
          className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors relative"
        >
          <Bell className="w-4 h-4 text-gray-600" />
        </Link>

        <Link
          href="/admin/pengaturan"
          className="flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 leading-tight">{session?.user?.name ?? 'Admin'}</p>
            <p className="text-xs text-gray-400 leading-tight capitalize">{session?.user?.role ?? 'admin'}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
