'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Upload, Loader2, CheckCircle, AlertCircle, ImagePlus, Crop, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// F2-Fase4 / T-40 — modal crop bersama (chunk terpisah, hanya diunduh
// saat dibuka): square 800×800 tanpa zoom, bingkai grid terpisah.
const CropModal = dynamic(() => import('@/components/admin/CropModal').then((m) => m.CropModal), {
  ssr: false,
})

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function GaleriUploadForm() {
  const router  = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [judul,      setJudul]      = useState('')
  const [preview,    setPreview]    = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [alert,      setAlert]      = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [cropSrc,    setCropSrc]    = useState<string | null>(null)
  const [croppedBlob,setCroppedBlob]= useState<Blob | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    // P1-B3: samakan dengan server (galeri/route.ts: 5MB, JPG/PNG/WEBP) —
    // tolak dini sebelum modal crop agar tak selalu 400.
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setAlert({ type: 'error', msg: 'Format harus JPG, PNG, atau WEBP' })
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      setAlert({ type: 'error', msg: 'Ukuran file maksimal 5MB' })
      return
    }
    setCropSrc(URL.createObjectURL(f))
  }

  const handleCropConfirm = (blob: Blob) => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setCroppedBlob(blob)
    setPreview(URL.createObjectURL(blob))
  }

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (!judul.trim()) {
      setAlert({ type: 'error', msg: 'Judul foto wajib diisi' })
      return
    }
    if (!croppedBlob) {
      setAlert({ type: 'error', msg: 'Pilih dan crop foto terlebih dahulu' })
      return
    }

    setLoading(true); setAlert(null)
    try {
      const formData = new FormData()
      formData.append('judul', judul)
      formData.append('foto', croppedBlob, 'foto.webp')

      const res  = await fetch('/api/admin/galeri', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal upload foto')

      setAlert({ type: 'success', msg: 'Foto berhasil diupload!' })
      setJudul(''); setCroppedBlob(null)
      if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
      window.dispatchEvent(new CustomEvent('admin:mutated'))
      router.refresh()
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message })
    }
    setLoading(false)
  }

  return (
    <>
      {cropSrc && (
        <CropModal
          src={cropSrc}
          title="Crop Foto Galeri"
          sizeLabel="800 × 800 px (1:1)"
          outputWidth={800}
          outputHeight={800}
          initialFill={0.85}
          overlay="grid-frame"
          height={380}
          footerHint="Kotak = area yang akan di-crop (1:1)"
          footerBar
          resetLabel="Reset"
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-800 mb-1">Upload Foto Baru</h2>
        <p className="text-xs text-stone-400 mb-4 flex items-center gap-1">
          <Crop className="size-3" /> Foto akan di-crop ke ukuran 800 × 800 px (1:1) secara otomatis
        </p>

        {alert && (
          <div className={`flex items-center gap-2.5 rounded-xl p-3.5 text-sm mb-4 ${alert.type === 'success' ? 'bg-sage-50 border border-sage-200 text-sage-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {alert.type === 'success' ? <CheckCircle className="size-4 flex-shrink-0" /> : <AlertCircle className="size-4 flex-shrink-0" />}
            {alert.msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Preview area — 1:1 */}
          <label className="cursor-pointer">
            <div className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${preview ? 'border-transparent' : 'border-stone-200 hover:border-primary-400 bg-stone-50'}`}>
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <>
                  <ImagePlus className="size-10 text-stone-400 mb-2" />
                  <p className="text-sm text-stone-400">Klik untuk pilih foto</p>
                  <p className="text-xs text-stone-400 mt-1">JPG, PNG, WEBP maks. 5MB</p>
                  <span className="mt-2 text-xs text-primary-500 font-medium flex items-center gap-1">
                    <Crop className="size-3" /> Editor crop 1:1 akan terbuka
                  </span>
                </>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
          </label>

          {/* Form fields */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Judul Foto</label>
              <Input
                type="text" value={judul} onChange={e => setJudul(e.target.value)}
                placeholder="Contoh: Acara HUT Kemerdekaan RI"
                className="" disabled={loading}
               />
              {croppedBlob && (
                <p className="text-xs text-sage-600 mt-1.5 flex items-center gap-1">
                  <Check className="size-3" /> Foto sudah di-crop (1:1) — siap upload
                </p>
              )}
            </div>

            <div className="space-y-2">
              {croppedBlob && (
                <button
                  type="button"
                  onClick={() => { if (preview) URL.revokeObjectURL(preview); setPreview(null); setCroppedBlob(null); if (inputRef.current) inputRef.current.value = '' }}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-stone-500 hover:text-red-500 py-2 border border-stone-200 hover:border-red-200 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Ganti Foto
                </button>
              )}
              <Button
                onClick={handleSubmit} disabled={loading}
                className=" w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 className="size-4 animate-spin" data-icon="inline-start" /> Mengupload...</> : <><Upload className="size-4" data-icon="inline-start" /> Upload Foto</>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
