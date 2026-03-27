'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { slugify } from '@/lib/utils'
import ImageUpload from './ImageUpload'
import TiptapEditor from './TiptapEditor'

interface BeritaFormData {
  judul: string
  slug: string
  konten: string
  thumbnail: string | null
}

interface Props {
  initialData?: BeritaFormData & { id?: number }
  mode: 'tambah' | 'edit'
}

export default function BeritaForm({ initialData, mode }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<BeritaFormData>({
    judul: initialData?.judul ?? '',
    slug: initialData?.slug ?? '',
    konten: initialData?.konten ?? '',
    thumbnail: initialData?.thumbnail ?? null,
  })
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleJudul = (val: string) => setForm({ ...form, judul: val, slug: slugify(val) })

  const handleSubmit = async () => {
    if (!form.judul || !form.konten || form.konten === '<p></p>') {
      setAlert({ type: 'error', msg: 'Judul dan konten wajib diisi' })
      return
    }
    setLoading(true)
    setAlert(null)
    try {
      const url = mode === 'edit' ? `/api/admin/berita/${initialData?.id}` : '/api/admin/berita'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan berita')
      setAlert({ type: 'success', msg: mode === 'edit' ? 'Berita berhasil diperbarui!' : 'Berita berhasil dipublish!' })
      setTimeout(() => router.push('/admin/berita'), 1000)
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      {alert && (
        <div className={`flex items-center gap-2.5 rounded-xl p-3.5 text-sm ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {alert.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {alert.msg}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Judul Berita <span className="text-red-500">*</span></label>
        <input type="text" value={form.judul} onChange={(e) => handleJudul(e.target.value)} className="input-field" placeholder="Judul berita yang menarik..." />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug (URL)</label>
        <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field bg-gray-50" />
        <p className="text-xs text-gray-400 mt-1">Otomatis dari judul berita</p>
      </div>

      <ImageUpload
        value={form.thumbnail}
        onChange={(url) => setForm({ ...form, thumbnail: url })}
        folder="berita"
        label="Thumbnail / Gambar Utama"
        aspect="video"
      />

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Konten Berita <span className="text-red-500">*</span>
        </label>
        <TiptapEditor
          value={form.konten}
          onChange={(html) => setForm({ ...form, konten: html })}
          placeholder="Tulis konten berita di sini..."
        />
        <p className="text-xs text-gray-400 mt-1">
          Gunakan toolbar di atas untuk memformat teks — bold, italic, heading, list, dan lainnya.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => router.back()} className="btn-outline px-6">Batal</button>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary px-6 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : mode === 'edit' ? 'Simpan Perubahan' : 'Publish Berita'}
        </button>
      </div>
    </div>
  )
}