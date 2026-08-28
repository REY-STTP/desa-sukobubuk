'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Store, Package, Newspaper, Building2,
  Images, MessageSquare, Settings, LogOut, ChevronRight, X, ExternalLink, ArrowLeftRight,
  Pin, PinOff,
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

interface Props {
  namaDesa: string
  logoUrl: string | null
  unreadCount?: number
}

function SidebarContent({ namaDesa, logoUrl, unreadCount = 0, onClose }: Props & { onClose: () => void }) {
  const pathname = usePathname()
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  const initial = namaDesa.split(' ').find(w => w.length > 2 && w.toLowerCase() !== 'desa')?.[0]?.toUpperCase() ?? namaDesa[0]
  return (
    <aside className="flex h-full w-64 flex-col bg-sage-900 text-stone-100">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <Link href="/admin" onClick={onClose} className="flex items-center gap-3">
          <div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15 shrink-0">
            {logoUrl ? <Image src={logoUrl} alt={namaDesa} width={40} height={40} className="size-full object-contain" unoptimized /> : <span className="font-display text-base font-semibold text-white">{initial}</span>}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold leading-tight text-white">{namaDesa}</p>
            <p className="text-[11px] leading-tight text-stone-400">Panel Admin</p>
          </div>
        </Link>
        <button onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-lg text-stone-400 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Tutup menu">
          <X className="size-4" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigasi admin">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Menu Utama</p>
        <ul className="space-y-0.5">
          {navItems.map(item => {
            const active = isActive(item.href, item.exact)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link href={item.href} onClick={onClose} aria-current={active ? 'page' : undefined} className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium', active ? 'bg-sage-700 text-white' : 'text-stone-300 hover:bg-white/5 hover:text-white')}>
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="flex-1">{item.label}</span>
                  {item.href === '/admin/pesan' && unreadCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-ember-500 text-xs font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  {active && <ChevronRight className="size-3.5 opacity-70" aria-hidden />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="shrink-0 border-t border-white/10 p-2">
        <div className="space-y-0.5">
          <Link
            href="/admin/pengaturan"
            onClick={onClose}
            aria-current={isActive('/admin/pengaturan') ? 'page' : undefined}
            className={cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium', isActive('/admin/pengaturan') ? 'bg-sage-700 text-white' : 'text-stone-300 hover:bg-white/5 hover:text-white')}
          >
            <Settings className="size-4 shrink-0" aria-hidden />
            Pengaturan Akun
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-300 hover:bg-ember-950/40 hover:text-ember-200"
          >
            <LogOut className="size-4 shrink-0" aria-hidden />
            Keluar
          </button>
        </div>
        <div className="my-2 h-px bg-white/10" />
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-stone-400 hover:bg-white/5 hover:text-white">
          <ArrowLeftRight className="size-3.5" aria-hidden />
          Lihat Website Publik
          <ExternalLink className="ml-auto size-3 opacity-60" aria-hidden />
        </Link>
      </div>
    </aside>
  )
}

function DesktopSidebar({ namaDesa, logoUrl, unreadCount = 0 }: Props) {
  const pathname = usePathname()
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  const initial = namaDesa.split(' ').find(w => w.length > 2 && w.toLowerCase() !== 'desa')?.[0]?.toUpperCase() ?? namaDesa[0]

  const [isLocked, setIsLocked] = useState(false)
  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-locked')
    if (saved === '1') setIsLocked(true)
  }, [])
  useEffect(() => {
    localStorage.setItem('admin-sidebar-locked', isLocked ? '1' : '0')
  }, [isLocked])

  // outer reserves collapsed width, inner absolute overlays on hover (tidak dorong konten, tiru index.html)
  const outerW = isLocked ? 'w-64' : 'w-[68px]'
  const innerW = isLocked ? 'w-64' : 'w-[68px] hover:w-64'

  return (
    <div className={cn('relative hidden h-screen shrink-0 transition-[width] duration-200 lg:block', outerW)}>
      <aside
        className={cn(
          'group/sb absolute inset-y-0 left-0 z-20 flex h-full flex-col overflow-hidden border-r border-white/10 bg-sage-900 text-stone-100 transition-[width] duration-200',
          innerW,
          !isLocked && 'hover:shadow-[8px_0_24px_rgba(0,0,0,0.35)]'
        )}
      >
        <div className="flex h-[64px] shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3">
          <Link href="/admin" className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
              {logoUrl ? <Image src={logoUrl} alt={namaDesa} width={36} height={36} className="size-full object-contain" unoptimized /> : <span className="font-display text-sm font-semibold text-white">{initial}</span>}
            </span>
            <span className={cn('min-w-0 transition-[opacity,transform] duration-200', isLocked ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover/sb:opacity-100 group-hover/sb:translate-x-0 group-hover/sb:delay-75')}>
              <span className="block truncate font-display text-sm font-semibold leading-tight text-white">{namaDesa}</span>
              <span className="block truncate text-[11px] leading-tight text-stone-400">Panel Admin</span>
            </span>
          </Link>
          <span className={cn('flex items-center gap-1 transition-[opacity,transform] duration-200', isLocked ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-1 group-hover/sb:opacity-100 group-hover/sb:translate-x-0 group-hover/sb:delay-75')}>
            <button
              onClick={() => setIsLocked(v => !v)}
              className={cn('grid size-7 place-items-center rounded-lg border transition-colors', isLocked ? 'border-sage-500 bg-sage-700 text-white' : 'border-white/10 bg-white/5 text-stone-400 hover:bg-white/10 hover:text-white')}
              aria-pressed={isLocked}
              aria-label={isLocked ? 'Lepas kunci' : 'Kunci tetap terbuka'}
              title={isLocked ? 'Terkunci' : 'Kunci'}
            >
              {isLocked ? <Pin className="size-3.5" /> : <PinOff className="size-3.5" />}
            </button>
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          <ul className="space-y-0.5 px-2">
            {navItems.map(item => {
              const active = isActive(item.href, item.exact)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    title={item.label}
                    className={cn(
                      'relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                      active ? 'bg-sage-700 text-white' : 'text-stone-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className={cn('flex-1 truncate whitespace-nowrap transition-[opacity,transform] duration-200', isLocked ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover/sb:opacity-100 group-hover/sb:translate-x-0 group-hover/sb:delay-75')}>
                      {item.label}
                    </span>
                    {item.href === '/admin/pesan' && unreadCount > 0 && (
                      <span className={cn('grid place-items-center rounded-full bg-ember-500 font-bold text-white ring-2 ring-sage-900 transition-all', isLocked ? 'size-5 text-xs static' : 'size-5 text-xs group-hover/sb:static absolute right-1 top-1 size-4 text-[10px] group-hover/sb:size-5 group-hover/sb:text-xs group-hover/sb:static')}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    <ChevronRight className={cn('size-3.5 opacity-0 transition-opacity', isLocked ? 'opacity-70' : 'group-hover/sb:opacity-70', active ? '!opacity-70' : '')} aria-hidden />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-2">
          <p className={cn('mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500 transition-opacity duration-200', !isLocked && 'opacity-0 pointer-events-none select-none')}>Akun</p>
          <div className="space-y-0.5">
            <Link
              href="/admin/pengaturan"
              aria-current={isActive('/admin/pengaturan') ? 'page' : undefined}
              title={!isLocked ? 'Pengaturan Akun' : undefined}
              className={cn(
                'flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium',
                isActive('/admin/pengaturan') ? 'bg-sage-700 text-white' : 'text-stone-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Settings className="size-4 shrink-0" aria-hidden />
              <span className={cn('flex-1 truncate whitespace-nowrap transition-[opacity,transform] duration-200', isLocked ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover/sb:opacity-100 group-hover/sb:translate-x-0 group-hover/sb:delay-75')}>
                Pengaturan Akun
              </span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              title={!isLocked ? 'Keluar' : undefined}
              className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-stone-400 hover:bg-ember-950/40 hover:text-ember-200"
            >
              <LogOut className="size-4 shrink-0" aria-hidden />
              <span className={cn('flex-1 truncate whitespace-nowrap text-left transition-[opacity,transform] duration-200', isLocked ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover/sb:opacity-100 group-hover/sb:translate-x-0 group-hover/sb:delay-75')}>
                Keluar
              </span>
            </button>
          </div>
          <div className="my-2 h-px bg-white/10" />
          <Link href="/" target="_blank" title={!isLocked ? 'Lihat Website Publik' : undefined} className="flex h-10 items-center gap-3 rounded-xl px-3 text-xs text-stone-400 hover:bg-white/5 hover:text-white">
            <ArrowLeftRight className="size-4 shrink-0" aria-hidden />
            <span className={cn('flex-1 truncate whitespace-nowrap transition-[opacity,transform] duration-200', isLocked ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover/sb:opacity-100 group-hover/sb:translate-x-0 group-hover/sb:delay-75')}>
              Lihat Website Publik
            </span>
          </Link>
        </div>
      </aside>
    </div>
  )
}

export default function AdminSidebar({ namaDesa, logoUrl, unreadCount = 0 }: Props) {
  const { isOpen, close } = useSidebar()
  return (
    <>
      <DesktopSidebar namaDesa={namaDesa} logoUrl={logoUrl} unreadCount={unreadCount} />
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-sage-950/70 backdrop-blur-sm" onClick={close} aria-hidden />
          <div className="relative flex shrink-0 animate-slide-in-left">
            <SidebarContent namaDesa={namaDesa} logoUrl={logoUrl} unreadCount={unreadCount} onClose={close} />
          </div>
        </div>
      )}
    </>
  )
}
