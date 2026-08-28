import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react'
import LoginForm from './LoginForm'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Login Admin | Desa Sukobubuk' }

export default async function LoginPage() {
  const profil = await prisma.profilDesa.findFirst({
    select: { nama_desa: true, nama_kecamatan: true, nama_kabupaten: true },
  })

  const namaDesa = profil?.nama_desa ?? 'Desa Sukobubuk'

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left: Brand panel (sage-800, dark) — desktop only */}
      <aside className="relative hidden overflow-hidden bg-sage-800 text-stone-100 lg:flex lg:flex-col lg:justify-between">
        {/* Decorative grain + topo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grain opacity-30"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-topo opacity-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-sage-600/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-ember-600/20 blur-3xl"
        />

        <div className="relative flex flex-1 flex-col p-10">
          {/* Top: logo + back to public */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                <Image
                  src="/images/logo-desa.png"
                  alt={namaDesa}
                  width={48}
                  height={48}
                  className="size-full object-contain"
                  unoptimized
                />
              </div>
              <div>
                <p className="font-display text-base font-semibold leading-tight text-white">
                  {namaDesa}
                </p>
                <p className="text-xs leading-tight text-stone-300">
                  {profil?.nama_kecamatan ?? 'Kec. Margorejo'}
                </p>
              </div>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-stone-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="size-3" data-icon="inline-start" />
              Beranda
            </Link>
          </div>

          {/* Center: tagline */}
          <div className="my-auto max-w-md">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-stone-200 backdrop-blur">
              <Sparkles className="size-3" />
              Panel Administrasi
            </div>
            <h2 className="font-display text-3xl font-medium leading-tight text-white text-balance md:text-4xl">
              Kelola website desa dari satu tempat.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-300">
              Berita, UMKM, produk, galeri, dan pesan warga — semua dalam satu
              dasbor yang tenang dan terstruktur.
            </p>
          </div>

          {/* Bottom: features */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <ShieldCheck className="mb-1.5 size-4 text-sage-300" />
              <p className="text-xs font-medium text-white">Akses Aman</p>
              <p className="text-[11px] text-stone-400">Autentikasi terenkripsi</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              <Sparkles className="mb-1.5 size-4 text-ember-300" />
              <p className="text-xs font-medium text-white">Konten Real-time</p>
              <p className="text-[11px] text-stone-400">Publish langsung</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Right: Form panel (stone-50) */}
      <main className="flex min-h-screen flex-col items-center justify-center bg-stone-50 p-6 sm:p-10 lg:min-h-0">
        <div className="flex w-full max-w-sm flex-col">
          {/* Mobile-only brand — di atas card form */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-sage-100 ring-1 ring-sage-200">
              <Image
                src="/images/logo-desa.png"
                alt={namaDesa}
                width={40}
                height={40}
                className="size-full object-contain"
                unoptimized
              />
            </div>
            <div>
              <p className="font-display text-sm font-semibold leading-tight text-stone-800">
                {namaDesa}
              </p>
              <p className="text-xs leading-tight text-stone-500">Panel Admin</p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="font-display text-2xl font-medium text-stone-800">
              Selamat Datang
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Masuk ke panel administrasi desa
            </p>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-xs text-stone-400">
            © {new Date().getFullYear()} Pemerintah {namaDesa}
          </p>
        </div>
      </main>
    </div>
  )
}
