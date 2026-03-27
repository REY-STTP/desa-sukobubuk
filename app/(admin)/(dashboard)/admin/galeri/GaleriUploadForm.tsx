'use client'

import { useState } from 'react'
import { Upload, Loader2, CheckCircle, AlertCircle, ImagePlus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GaleriUploadForm() {
  const router = useRouter()
  const [judul, setJudul] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async () => {
    if (!judul.trim()) { setAlert({ type: 'error', msg: 'Judul foto wajib diisi' }); return }
    if (!file) { setAlert({ type: 'error', msg: 'Pilih foto terlebih dahulu' }); return }

    setLoading(true)
    setAlert(null)

    try {
      const formData = new FormData()
      formData.append('judul', judul)
      formData.append('foto', file)

      const res = await fetch('/api/admin/galeri', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal upload foto')

      setAlert({ type: 'success', msg: 'Foto berhasil diupload!' })
      setJudul('')
      setFile(null)
      setPreview(null)
      router.refresh()
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message })
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Upload Foto Baru</h2>

      {alert && (
        <div className={`flex items-center gap-2.5 rounded-xl p-3.5 text-sm mb-4 ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {alert.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {alert.msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Preview area */}
        <label className="cursor-pointer">
          <div className={`aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${preview ? 'border-transparent' : 'border-gray-200 hover:border-primary-400 bg-gray-50'}`}>
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <>
                <ImagePlus className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Klik untuk pilih foto</p>
                <p className="text-xs text-gray-300 mt-1">JPG, PNG, WEBP maks. 5MB</p>
              </>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>

        {/* Form fields */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Foto</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Acara HUT Kemerdekaan RI"
              className="input-field"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengupload...</> : <><Upload className="w-4 h-4" /> Upload Foto</>}
          </button>
        </div>
      </div>
    </div>
  )
}
