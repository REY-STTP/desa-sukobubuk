import Link from 'next/link'
import { headers } from 'next/headers'
import { Home, Search, ArrowLeft, Compass, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

/**
 * Global 404 — dipanggil untuk SEMUA route yang tidak ditemukan
 * (public, admin, api yang return notFound(), dll).
 * 
 * Deteksi otomatis apakah user di area admin (pathname mulai /admin)
 * dan tampilkan versi branded admin (sage-900 dark).
 * Untuk route publik tampilkan versi terang dengan motif desa.
 */
export default async function GlobalNotFound() {
  const h = await headers()
  const pathname = h.get('x-invoke-path') ?? h.get('next-url') ?? h.get('referer') ?? ''
  const isAdmin = pathname.startsWith('/admin')

  // Untuk admin: tampilkan panel dark, ringkas, no decorative
  if (isAdmin) {
    return <AdminNotFound />
  }

  // Untuk publik: tampilkan branded dengan motif desa
  const profil = await prisma.profilDesa.findFirst().catch(() => null)
  const namaDesa = profil?.nama_desa ?? 'Desa Sukobubuk'
  return <PublicNotFound namaDesa={namaDesa} />
}

function PublicNotFound({ namaDesa }: { namaDesa: string }) {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-50 px-6 py-16 sm:px-10"
      aria-label="Halaman tidak ditemukan"
    >
      {/* Decorative motif */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-topo opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-sage-500/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-ember-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grain opacity-40"
      />

      <div className="relative w-full max-w-md text-center">
        <div className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sage-700">
          <Compass className="size-4" />
          Halaman Tidak Ditemukan
        </div>

        <p
          aria-hidden
          className="select-none font-display text-[8rem] font-medium leading-none text-sage-200 md:text-[12rem]"
        >
          404
        </p>

        <h1 className="mt-2 font-display text-2xl font-medium text-stone-800 text-balance md:text-3xl">
          Halaman yang Anda cari tidak ada
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600">
          Mungkin halaman telah dipindahkan, atau tautan yang Anda ikuti sudah
          tidak berlaku. Silakan kembali ke beranda.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="size-4" data-icon="inline-start" />
              Kembali ke Beranda
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/kontak">
              <Search className="size-4" data-icon="inline-start" />
              Hubungi Kami
            </Link>
          </Button>
        </div>

        <p className="mt-10 text-xs text-stone-400">
          Atau kembali ke{' '}
          <Link
            href="/berita"
            className="text-sage-700 underline-offset-4 hover:text-sage-800 hover:underline"
          >
            daftar berita
          </Link>
          {' atau '}
          <Link
            href="/umkm"
            className="text-sage-700 underline-offset-4 hover:text-sage-800 hover:underline"
          >
            direktori UMKM
          </Link>
          .
        </p>

        <div className="mt-10">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-stone-500 hover:bg-stone-100"
          >
            <Link href="javascript:history.back()">
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Halaman sebelumnya
            </Link>
          </Button>
        </div>

        <p className="mt-12 text-[11px] text-stone-400">
          © {new Date().getFullYear()} {namaDesa}
        </p>
      </div>
    </main>
  )
}

function AdminNotFound() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sage-900 px-6 py-16 text-stone-100 sm:px-10"
      aria-label="Halaman tidak ditemukan"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grain opacity-30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 size-80 rounded-full bg-sage-700/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-ember-600/15 blur-3xl"
      />

      <div className="relative w-full max-w-md text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-200 backdrop-blur">
          <ShieldCheck className="size-3.5" />
          Panel Admin
        </div>

        <p
          aria-hidden
          className="select-none font-display text-[8rem] font-medium leading-none text-sage-700/40 md:text-[12rem]"
        >
          404
        </p>

        <h1 className="mt-2 font-display text-2xl font-medium text-white text-balance md:text-3xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-300">
          Halaman admin yang Anda akses tidak ada atau telah dipindahkan.
          Periksa kembali tautan, atau kembali ke dashboard.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-sage-700 text-white hover:bg-sage-600">
            <Link href="/admin">
              <Home className="size-4" data-icon="inline-start" />
              Ke Dashboard
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="javascript:history.back()">
              <ArrowLeft className="size-4" data-icon="inline-start" />
              Halaman sebelumnya
            </Link>
          </Button>
        </div>

        <p className="mt-12 text-[11px] text-stone-500">
          Protected area · Akses admin terdeteksi
        </p>
      </div>
    </main>
  )
}
