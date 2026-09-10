'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'

interface Props {
  embedUrl: string
  namaDesa: string
}

/**
 * F2-FaseP1 / T-P10 — facade peta: iframe Google Maps (~500KB + puluhan
 * request) hanya dibuat SETELAH diklik. Sebelumnya iframe langsung
 * dirender di footer semua halaman publik. Server tetap me-render tombol
 * (link SEO aman di `Footer` terpisah); kondisional ada-URL dan `frame-src`
 * CSP tak berubah.
 */
export default function MapsFacade({ embedUrl, namaDesa }: Props) {
  const [open, setOpen] = useState(false)

  if (open) {
    return (
      <div className="mt-5 overflow-hidden rounded-xl border border-white/10 ring-1 ring-inset ring-white/5">
        <iframe
          src={embedUrl}
          width="100%"
          height="140"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title={`Lokasi ${namaDesa}`}
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="mt-5 flex h-[140px] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-sage-950/60 text-sage-200 ring-1 ring-inset ring-white/5 transition-colors hover:bg-sage-900/70 hover:text-white"
      aria-label={`Muat peta lokasi ${namaDesa}`}
    >
      <MapPin className="size-6" aria-hidden />
      <span className="text-xs font-medium">Lihat Peta Lokasi</span>
      <span className="text-[11px] text-sage-400">Klik untuk memuat Google Maps</span>
    </button>
  )
}
