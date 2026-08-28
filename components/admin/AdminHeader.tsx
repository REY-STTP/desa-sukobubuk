'use client'

import { useSession } from 'next-auth/react'
import { Bell, Menu, LogOut, Settings, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { useSidebar } from './SidebarContext'
import { cn } from '@/lib/utils'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function getTodayFormatted(): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

export default function AdminHeader() {
  const { data: session } = useSession()
  const { toggle } = useSidebar()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', onClick)
      return () => document.removeEventListener('mousedown', onClick)
    }
  }, [menuOpen])

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={toggle}
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-800 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="size-4" />
        </button>

        <div className="hidden min-w-0 sm:block">
          <p className="text-xs text-stone-500">
            {getGreeting()}, {getTodayFormatted()}
          </p>
          <p className="truncate font-display text-base font-medium text-stone-800">
            {session?.user?.name ?? 'Admin'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/admin/pesan"
          className="grid size-9 place-items-center rounded-xl bg-stone-100 text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-800"
          aria-label="Pesan masuk"
        >
          <Bell className="size-4" />
        </Link>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl bg-stone-100 py-1.5 pl-1.5 pr-3 text-stone-700 transition-colors hover:bg-stone-200"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-sage-700 text-xs font-semibold text-white">
              {session?.user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold leading-tight text-stone-800">
                {session?.user?.name ?? 'Admin'}
              </p>
              <p className="text-[11px] leading-tight text-stone-500 capitalize">
                {session?.user?.role ?? 'admin'}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'size-3.5 text-stone-500 transition-transform',
                menuOpen && 'rotate-180'
              )}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-stone-200 bg-white p-1.5 shadow-elevated-4"
            >
              <Link
                href="/admin/pengaturan"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-100"
              >
                <Settings className="size-4" />
                Pengaturan Akun
              </Link>
              <div className="my-1 h-px bg-stone-100" />
              <button
                role="menuitem"
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ember-700 transition-colors hover:bg-ember-50"
              >
                <LogOut className="size-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
