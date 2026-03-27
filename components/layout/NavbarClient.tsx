'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

export default function NavbarClient({ namaDesa, logoUrl, namaKecamatan, namaKabupaten }: Props) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profilOpen, setProfilOpen] = useState(false)

  const initial = namaDesa.split(' ').find(w => w.length > 2 && w.toLowerCase() !== 'desa')?.[0]?.toUpperCase() ?? namaDesa[0]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-primary-800/80 backdrop-blur-md shadow-md'
        : 'bg-primary-700/80 backdrop-blur-sm'
    )}>
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-md group-hover:bg-white/30 transition-colors overflow-hidden flex-shrink-0">
              {logoUrl ? (
                <Image src={logoUrl} alt={`Logo ${namaDesa}`} width={40} height={40} className="w-full h-full object-contain" unoptimized />
              ) : (
                <span className="text-white font-display font-bold text-lg">{initial}</span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="font-display font-bold text-white text-sm leading-tight">{namaDesa}</p>
              <p className="text-xs text-white/70 leading-tight">{namaKecamatan}, {namaKabupaten}</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label} className="relative group">
                    <button className={cn(
                      'flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                      pathname.startsWith('/profil')
                        ? 'text-white bg-white/20'
                        : 'text-white/80 hover:text-white hover:bg-white/25'
                    )}>
                      {item.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}
                          className={cn(
                            'block px-4 py-2.5 text-sm hover:bg-primary-50 hover:text-primary-700 transition-colors',
                            pathname === child.href ? 'text-primary-700 bg-primary-50 font-semibold' : 'text-gray-700'
                          )}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }
              return (
                <Link key={item.href} href={item.href!}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
                    pathname === item.href
                      ? 'text-white bg-white/20'
                      : 'text-white/80 hover:text-white hover:bg-white/25'
                  )}>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/25 transition-colors">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-white/20 py-3 space-y-1">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label}>
                    <button onClick={() => setProfilOpen(!profilOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold text-white/80 hover:text-white hover:bg-white/25 transition-colors">
                      {item.label}
                      <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', profilOpen && 'rotate-180')} />
                    </button>
                    {profilOpen && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-white/20 pl-4">
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href} onClick={() => setIsOpen(false)}
                            className={cn(
                              'block px-3 py-2 rounded-lg text-sm transition-colors',
                              pathname === child.href
                                ? 'text-white font-semibold bg-white/20'
                                : 'text-white/70 hover:text-white hover:bg-white/25'
                            )}>
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
              return (
                <Link key={item.href} href={item.href!} onClick={() => setIsOpen(false)}
                  className={cn(
                    'block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                    pathname === item.href
                      ? 'text-white bg-white/20'
                      : 'text-white/80 hover:text-white hover:bg-white/25'
                  )}>
                  {item.label}
                </Link>
              )
            })}
          </div>
        )}
      </nav>
    </header>
  )
}