'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RotateCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * P1-U4: batas error berbahasa Indonesia. Tampil bila runtime error tak
 * tertangkap (mis. DB down saat render dinamis) — sebelumnya jatuh ke
 * halaman error default Next berbahasa Inggris.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Catat ke console server/observability; jangan tampilkan ke pengguna.
    console.error(error)
  }, [error])

  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <main
          className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 text-center"
          aria-label="Terjadi kesalahan"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-ember-100 ring-1 ring-inset ring-ember-200">
            <TriangleAlert className="size-7 text-ember-600" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-medium text-stone-800">
            Maaf, terjadi kesalahan
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-600">
            Halaman tidak dapat dimuat saat ini. Silakan coba lagi, atau
            kembali ke beranda. Jika berlanjut, hubungi kami lewat halaman
            Kontak.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => reset()}>
              <RotateCcw className="size-4" data-icon="inline-start" />
              Coba lagi
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="size-4" data-icon="inline-start" />
                Ke Beranda
              </Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  )
}
