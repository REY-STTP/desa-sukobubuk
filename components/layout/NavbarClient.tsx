'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, ChevronDown, X, Phone, Mail, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/', label: 'Beranda' },
  {
    label: 'Profil Desa',
    children: [
      { href: '/profil/sejarah', label: 'Sejarah Desa' },
      { href: '/profil/visi-misi', label: 'Visi & Misi' },
      { href: '/profil/struktur-organisasi', label: 'Struktur Organisasi' },
    ],
  },
  { href: '/berita', label: 'Berita' },
  { href: '/umkm', label: 'UMKM' },
  { href: '/kontak', label: 'Kontak' },
]

interface Props {
  namaDesa: string
  logoUrl: string | null
  namaKecamatan: string
  namaKabupaten: string
  telepon?: string | null
  email?: string | null
  alamat?: string | null
}

export default function NavbarClient({
  namaDesa,
  logoUrl,
  namaKecamatan,
  namaKabupaten,
  telepon,
  email,
  alamat,
}: Props) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [profilOpen, setProfilOpen] = useState(() => pathname.startsWith('/profil'))
  const [open, setOpen] = useState(false)

  const initial =
    namaDesa
      .split(' ')
      .find((w) => w.length > 2 && w.toLowerCase() !== 'desa')?.[0]
      ?.toUpperCase() ?? namaDesa[0]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (pathname.startsWith('/profil')) setProfilOpen(true)
  }, [pathname])

  const linkBase =
    'relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200'

  const isActivePath = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const isHeroMode = pathname === '/' && !scrolled

  const linkIdle = !isHeroMode
    ? 'text-stone-700 hover:text-sage-700 hover:bg-sage-50/80'
    : 'text-white/90 hover:text-white hover:bg-white/15'
  const linkActive = !isHeroMode ? 'text-sage-700 bg-sage-50' : 'text-white bg-white/20'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        !isHeroMode
          ? 'bg-white/85 shadow-elevated-2 backdrop-blur-md ring-1 ring-stone-200/60'
          : 'bg-sage-950/20 backdrop-blur-md border-b border-white/10 supports-[backdrop-filter]:bg-sage-950/10'
      )}
    >
      <nav className="container-custom" aria-label="Navigasi utama">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link
            href="/"
            className={cn(
              'group flex items-center gap-3 transition-colors',
              isHeroMode ? 'text-white' : 'text-stone-800'
            )}
            aria-label={`Beranda ${namaDesa}`}
          >
            <span
              className={cn(
                'relative grid size-10 place-items-center overflow-hidden rounded-xl ring-1 transition-all duration-300 group-hover:scale-105',
                isHeroMode
                  ? 'bg-white/15 ring-white/30 backdrop-blur-sm'
                  : 'bg-sage-100 ring-sage-200'
              )}
            >
              {logoUrl ? (
                <Image src={logoUrl} alt={`Logo ${namaDesa}`} width={40} height={40} className="size-full object-contain" unoptimized />
              ) : (
                <span className={cn('font-display text-lg font-semibold', isHeroMode ? 'text-white' : 'text-sage-700')}>
                  {initial}
                </span>
              )}
            </span>
            <span className="hidden sm:block">
              <span className={cn('block font-display text-sm font-semibold leading-tight', isHeroMode ? 'text-white' : 'text-stone-800')}>
                {namaDesa}
              </span>
              <span className={cn('block text-[11px] leading-tight transition-colors', isHeroMode ? 'text-white/80' : 'text-stone-500')}>
                {namaKecamatan}, {namaKabupaten}
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 md:flex">
            {navItems.map((item) => {
              if (item.children) {
                const isActive = pathname.startsWith('/profil')
                return (
                  <div key={item.label} className="group relative">
                    <button
                      className={cn(linkBase, 'inline-flex items-center', isActive ? linkActive : linkIdle)}
                      aria-expanded="false"
                      aria-haspopup="menu"
                    >
                      {item.label}
                      <ChevronDown className="ml-1 inline size-3.5 transition-transform duration-200 group-hover:rotate-180" />
                    </button>
                    <div className="invisible absolute left-0 top-full mt-1 w-56 translate-y-1 rounded-xl border border-stone-200/80 bg-white p-1.5 opacity-0 shadow-elevated-3 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 focus-within:visible focus-within:translate-y-0 focus-within:opacity-100">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'block rounded-lg px-3.5 py-2 text-sm transition-colors',
                            pathname === child.href ? 'bg-sage-50 font-semibold text-sage-700' : 'text-stone-700 hover:bg-stone-50 hover:text-sage-700'
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={cn(linkBase, isActivePath(item.href!) ? linkActive : linkIdle)}
                  aria-current={isActivePath(item.href!) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn('md:hidden', isHeroMode ? 'text-white hover:bg-white/15' : 'text-stone-700 hover:bg-stone-100')}
                aria-label="Buka menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" showCloseButton={false} className="flex w-3/4 flex-col border-0 bg-stone-50 p-0 text-stone-800 sm:max-w-sm">
              <SheetTitle className="sr-only">Menu navigasi</SheetTitle>

              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3" aria-label={`Beranda ${namaDesa}`}>
                  <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-sage-100 ring-1 ring-sage-200">
                    {logoUrl ? (
                      <Image src={logoUrl} alt={namaDesa} width={40} height={40} className="size-full object-contain" unoptimized />
                    ) : (
                      <span className="font-display text-base font-semibold text-sage-700">{initial}</span>
                    )}
                  </span>
                  <span>
                    <span className="block font-display text-sm font-semibold leading-tight text-stone-800">{namaDesa}</span>
                    <span className="block text-[11px] leading-tight text-stone-500">
                      {namaKecamatan}, {namaKabupaten}
                    </span>
                  </span>
                </Link>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="text-stone-500 hover:bg-stone-100 hover:text-stone-800" aria-label="Tutup menu">
                    <X className="size-5" />
                  </Button>
                </SheetClose>
              </div>

              <nav className="flex flex-col gap-0.5 px-3 py-4" aria-label="Navigasi mobile">
                {navItems.map((item) => {
                  if (item.children) {
                    return (
                      <div key={item.label} className="py-1">
                        <button
                          onClick={() => setProfilOpen((v) => !v)}
                          className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100"
                          aria-expanded={profilOpen}
                        >
                          {item.label}
                          <ChevronDown className={cn('size-4 text-stone-500 transition-transform duration-200', profilOpen && 'rotate-180')} />
                        </button>
                        {profilOpen && (
                          <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-sage-200 pl-3">
                            {item.children.map((child) => (
                              <SheetClose asChild key={child.href}>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    'block rounded-lg px-3 py-2 text-sm transition-colors',
                                    pathname === child.href ? 'bg-sage-50 font-semibold text-sage-700' : 'text-stone-600 hover:bg-stone-100 hover:text-sage-700'
                                  )}
                                >
                                  {child.label}
                                </Link>
                              </SheetClose>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  }
                  return (
                    <SheetClose asChild key={item.href}>
                      <Link
                        href={item.href!}
                        className={cn(
                          'rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                          isActivePath(item.href!) ? 'bg-sage-50 text-sage-700' : 'text-stone-700 hover:bg-stone-100'
                        )}
                        aria-current={isActivePath(item.href!) ? 'page' : undefined}
                      >
                        {item.label}
                      </Link>
                    </SheetClose>
                  )
                })}
              </nav>

              {(telepon || email || alamat) && (
                <div className="mx-3 mb-4 mt-auto rounded-2xl border border-stone-200 bg-white p-4">
                  <p className="section-eyebrow mb-3 text-stone-500">Kontak Desa</p>
                  <ul className="space-y-2.5 text-sm">
                    {alamat && (
                      <li className="flex items-start gap-2.5 text-stone-600">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-sage-600" />
                        <span className="leading-relaxed">{alamat}</span>
                      </li>
                    )}
                    {telepon && (
                      <li className="flex items-center gap-2.5 text-stone-600">
                        <Phone className="size-4 shrink-0 text-sage-600" />
                        <a href={`tel:${telepon}`} className="hover:text-sage-700">
                          {telepon}
                        </a>
                      </li>
                    )}
                    {email && (
                      <li className="flex items-center gap-2.5 text-stone-600">
                        <Mail className="size-4 shrink-0 text-sage-600" />
                        <a href={`mailto:${email}`} className="break-all hover:text-sage-700">
                          {email}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
