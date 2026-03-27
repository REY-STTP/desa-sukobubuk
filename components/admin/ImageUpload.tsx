'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'

interface Props {
  value: string | null          // current image URL (dari DB)
  onChange: (url: string | null) => void
  folder: 'berita' | 'umkm' | 'produk'
  label?: string
  aspect?: 'video' | 'square'  // video = 16:9, square = 1:1
}

export default function ImageUpload({ value, onChange, folder, label = 'Gambar', aspect = 'video' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = async (file: File) => {
    setError(null)
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Format harus JPG, PNG, atau WEBP')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setError('Ukuran maksimal 3MB')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)

      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal upload')
      onChange(data.url)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }

  const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-video'

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>

      {value ? (
        <div className="relative group">
          <div className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-gray-100 border border-gray-200`}>
            <Image src={value} alt={label} fill className="object-cover" unoptimized />
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 flex items-center gap-1.5 text-xs bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Upload className="w-3 h-3" /> Ganti
          </button>
        </div>
      ) : (
        <div
          onClick={() => !loading && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          className={`w-full ${aspectClass} border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors
            ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-400 hover:bg-gray-50'}
            ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {loading
            ? <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-2" />
            : <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
          }
          <p className="text-sm font-medium text-gray-600">{loading ? 'Mengupload...' : 'Klik atau drag & drop'}</p>
          <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP — Maks. 3MB</p>
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
  )
}
