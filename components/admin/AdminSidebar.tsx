'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Store, Package, Newspaper, Building2,
  Images, MessageSquare, Settings, LogOut, ChevronRight, X,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useSidebar } from './SidebarContext'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/umkm', label: 'Kelola UMKM', icon: Store },
  { href: '/admin/produk', label: 'Kelola Produk', icon: Package },
  { href: '/admin/berita', label: 'Kelola Berita', icon: Newspaper },
  { href: '/admin/galeri', label: 'Kelola Galeri', icon: Images },
  { href: '/admin/profil', label: 'Profil Desa', icon: Building2 },
  { href: '/admin/pesan', label: 'Pesan Masuk', icon: MessageSquare },
]

interface Props { namaDesa: string; logoUrl: string | null }

function SidebarContent({ namaDesa, logoUrl, onClose }: Props & { onClose: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  const initial = namaDesa.split(' ').find(w => w.length > 2 && w.toLowerCase() !== 'desa')?.[0]?.toUpperCase() ?? namaDesa[0]

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <Link href="/admin" onClick={onClose} className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            {logoUrl ? (
              <Image src={logoUrl} alt={namaDesa} width={36} height={36} className="w-full h-full object-contain" unoptimized />
            ) : (
              <span className="font-display font-bold text-white text-lg">{initial}</span>
            )}
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">{namaDesa}</p>
            <p className="text-xs text-gray-400 leading-tight">Panel Admin</p>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest px-3 mb-3">Menu</p>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive(item.href, item.exact) ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}>
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{item.label}</span>
            {isActive(item.href, item.exact) && <ChevronRight className="w-3 h-3 opacity-70" />}
          </Link>
        ))}
        <div className="pt-4 mt-4 border-t border-gray-800 space-y-1">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest px-3 mb-3">Akun</p>
          <Link href="/admin/pengaturan" onClick={onClose}
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive('/admin/pengaturan') ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}>
            <Settings className="w-4 h-4 flex-shrink-0" />
            Pengaturan Akun
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-all duration-200">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Keluar
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link href="/" target="_blank" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          <ChevronRight className="w-3 h-3 rotate-180" />
          Lihat Website Publik
        </Link>
      </div>
    </aside>
  )
}

export default function AdminSidebar({ namaDesa, logoUrl }: Props) {
  const { isOpen, close } = useSidebar()
  return (
    <>
      <div className="hidden lg:flex w-64 flex-shrink-0 min-h-screen">
        <SidebarContent namaDesa={namaDesa} logoUrl={logoUrl} onClose={() => {}} />
      </div>
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <div className="relative w-64 flex-shrink-0 animate-slide-in-left">
            <SidebarContent namaDesa={namaDesa} logoUrl={logoUrl} onClose={close} />
          </div>
        </div>
      )}
    </>
  )
}
