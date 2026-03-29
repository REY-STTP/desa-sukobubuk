'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { slugify } from '@/lib/utils'
import ImageCropUpload from './ImageCropUpload'

interface UMKMFormData {
  nama_usaha: string
  slug: string
  pemilik: string
  kategori: string
  deskripsi: string
  alamat: string
  whatsapp: string
  is_featured: boolean
  logo: string | null
}

interface Props {
  initialData?: UMKMFormData & { id?: number }
  mode: 'tambah' | 'edit'
}

const KATEGORI = ['Makanan', 'Kerajinan', 'Jasa', 'Pertanian', 'Perdagangan', 'Lainnya']

export default function UMKMForm({ initialData, mode }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<UMKMFormData>({
    nama_usaha: initialData?.nama_usaha ?? '',
    slug: initialData?.slug ?? '',
    pemilik: initialData?.pemilik ?? '',
    kategori: initialData?.kategori ?? 'Makanan',
    deskripsi: initialData?.deskripsi ?? '',
    alamat: initialData?.alamat ?? '',
    whatsapp: initialData?.whatsapp ?? '',
    is_featured: initialData?.is_featured ?? false,
    logo: initialData?.logo ?? null,
  })
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleNama = (val: string) => setForm({ ...form, nama_usaha: val, slug: slugify(val) })

  const handleSubmit = async () => {
    if (!form.nama_usaha || !form.pemilik || !form.deskripsi || !form.alamat || !form.whatsapp) {
      setAlert({ type: 'error', msg: 'Semua field wajib diisi' })
      return
    }
    setLoading(true)
    setAlert(null)
    try {
      const url = mode === 'edit' ? `/api/admin/umkm/${initialData?.id}` : '/api/admin/umkm'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data')
      setAlert({ type: 'success', msg: mode === 'edit' ? 'UMKM berhasil diperbarui!' : 'UMKM berhasil ditambahkan!' })
      setTimeout(() => router.push('/admin/umkm'), 1000)
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Usaha <span className="text-red-500">*</span></label>
          <input type="text" value={form.nama_usaha} onChange={(e) => handleNama(e.target.value)} className="input-field" placeholder="Batik Sukobubuk" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug (URL)</label>
          <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field bg-gray-50" />
          <p className="text-xs text-gray-400 mt-1">Otomatis dari nama usaha</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Pemilik <span className="text-red-500">*</span></label>
          <input type="text" value={form.pemilik} onChange={(e) => setForm({ ...form, pemilik: e.target.value })} className="input-field" placeholder="Ibu Sari Dewi" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori <span className="text-red-500">*</span></label>
          <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="input-field">
            {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">No. WhatsApp <span className="text-red-500">*</span></label>
          <input type="text" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input-field" placeholder="628123456789" />
          <p className="text-xs text-gray-400 mt-1">Format: 628xxx (tanpa + atau 0)</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat <span className="text-red-500">*</span></label>
          <input type="text" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="input-field" placeholder="Jl. Merdeka No. 12" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi <span className="text-red-500">*</span></label>
        <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="input-field min-h-[120px] resize-none" placeholder="Ceritakan tentang usaha ini..." />
      </div>

      <ImageCropUpload
        value={form.logo}
        onChange={(url) => setForm({ ...form, logo: url })}
        folder="umkm"
        label="Logo / Foto UMKM"
        aspect="square"
      />

      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <input type="checkbox" id="is_featured" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 accent-primary-600" />
        <label htmlFor="is_featured" className="text-sm font-medium text-gray-700 cursor-pointer">
          Tampilkan sebagai UMKM Unggulan di halaman utama
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => router.back()} className="btn-outline px-6">Batal</button>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary px-6 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah UMKM'}
        </button>
      </div>
    </div>
  )
}
