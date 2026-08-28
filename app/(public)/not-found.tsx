import Link from 'next/link'
import { Home, Search, ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'

export default function NotFound() {
  return (
    <Section
      variant="subtle"
      spacing="loose"
      pattern="topo"
      size="narrow"
      className="text-center"
    >
      <div className="mb-6 inline-flex items-center gap-2 text-sage-700 font-semibold text-xs uppercase tracking-[0.14em]">
        <Compass className="size-4" />
        Halaman Tidak Ditemukan
      </div>

      <p
        aria-hidden
        className="select-none font-display text-[8rem] font-medium leading-none text-sage-200 md:text-[12rem]"
      >
        404
      </p>

      <h1 className="mt-2 font-display text-2xl font-medium text-stone-800 md:text-3xl text-balance">
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
          className="text-sage-700 hover:text-sage-800 underline-offset-4 hover:underline"
        >
          daftar berita
        </Link>
        {' atau '}
        <Link
          href="/umkm"
          className="text-sage-700 hover:text-sage-800 underline-offset-4 hover:underline"
        >
          direktori UMKM
        </Link>
        .
      </p>

      <div className="mt-12">
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
    </Section>
  )
}
