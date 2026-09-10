'use client'

import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { X, Loader2, ImageIcon, Crop } from 'lucide-react'

// F2-Fase4 / T-40 — modal crop bersama (chunk terpisah, hanya diunduh
// saat dibuka). Varian editor: aspect video|square + zoom + lebar.
const CropModal = dynamic(() => import('@/components/admin/CropModal').then((m) => m.CropModal), {
  ssr: false,
})

// ─── Ukuran output ────────────────────────────────────────────────────────────
const OUTPUT_SIZE: Record<'video' | 'square', { width: number; height: number; label: string }> = {
  video:  { width: 1280, height: 720,  label: '1280 × 720 px (16:9)' },
  square: { width: 512,  height: 512,  label: '512 × 512 px (1:1)'   },
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  value: string | null
  onChange: (url: string | null) => void
  folder: 'berita' | 'umkm' | 'produk'
  label?: string
  aspect?: 'video' | 'square'
}

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function ImageCropUpload({
  value, onChange, folder, label = 'Gambar', aspect = 'video',
}: Props) {
  const inputRef    = useRef<HTMLInputElement>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [isDragging,setIsDragging]= useState(false)

  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-video'
  const { label: sizeLabel } = OUTPUT_SIZE[aspect]

  const handleFile = (file: File) => {
    setError(null)
    // P1-B3: samakan dengan server (/api/admin/upload: 5MB, JPG/PNG/WEBP).
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Format harus JPG, PNG, atau WEBP')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB')
      return
    }
    const url = URL.createObjectURL(file)
    setCropSrc(url)
  }

  const handleCropConfirm = async (blob: Blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', blob, 'image.webp')
      fd.append('folder', folder)

      const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal upload')
      onChange(data.url)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      {cropSrc && (
        <CropModal
          src={cropSrc}
          title="Crop & Resize Gambar"
          sizeLabel={sizeLabel}
          outputWidth={OUTPUT_SIZE[aspect].width}
          outputHeight={OUTPUT_SIZE[aspect].height}
          aspect={aspect}
          showZoom
          overlay="grid-box"
          wide
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">
          {label}
          <span className="ml-1.5 text-xs font-normal text-stone-400">({sizeLabel})</span>
        </label>

        {value ? (
          <div className="relative group">
            <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-stone-100 border border-stone-200`}>
              <Image
                src={value}
                alt={label}
                fill
                className="object-cover"
                unoptimized={value.startsWith('blob:') || value.startsWith('/uploads/')}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 size-8 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
            >
              <X className="size-4 text-white" />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 text-xs bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Crop className="size-3" /> Ganti &amp; Crop
            </button>
          </div>
        ) : (
          <div
            onClick={() => !loading && inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            className={`w-full ${aspectClass} border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors
              ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-stone-200 hover:border-primary-400 hover:bg-stone-50'}
              ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading
              ? <Loader2 className="size-8 animate-spin text-primary-500 mb-2" />
              : <ImageIcon className="size-8 text-stone-400 mb-2" />
            }
            <p className="text-sm font-medium text-stone-600">
              {loading ? 'Mengupload...' : 'Klik atau drag & drop'}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">JPG, PNG, WEBP — Maks. 5MB</p>
            {!loading && (
              <span className="mt-2 flex items-center gap-1 text-xs text-primary-500 font-medium">
                <Crop className="size-3" /> Akan dibuka editor crop
              </span>
            )}
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>
    </>
  )
}
