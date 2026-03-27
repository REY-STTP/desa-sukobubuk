'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { slugify } from '@/lib/utils'
import ImageUpload from './ImageUpload'

interface ProdukFormData {
  nama_produk: string
  slug: string
  deskripsi: string
  harga: string
  umkm_id: string
  is_available: boolean
  foto: string | null
}

interface Props {
  initialData?: ProdukFormData & { id?: number }
  mode: 'tambah' | 'edit'
  umkmList: { id: number; nama_usaha: string }[]
}

export default function ProdukForm({ initialData, mode, umkmList }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<ProdukFormData>({
    nama_produk: initialData?.nama_produk ?? '',
    slug: initialData?.slug ?? '',
    deskripsi: initialData?.deskripsi ?? '',
    harga: initialData?.harga ?? '',
    umkm_id: initialData?.umkm_id ?? (umkmList[0]?.id?.toString() ?? ''),
    is_available: initialData?.is_available ?? true,
    foto: initialData?.foto ?? null,
  })
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleNama = (val: string) => setForm({ ...form, nama_produk: val, slug: slugify(val) })

  const handleSubmit = async () => {
    if (!form.nama_produk || !form.deskripsi || !form.harga || !form.umkm_id) {
      setAlert({ type: 'error', msg: 'Semua field wajib diisi' })
      return
    }
    if (isNaN(Number(form.harga)) || Number(form.harga) <= 0) {
      setAlert({ type: 'error', msg: 'Harga harus berupa angka valid' })
      return
    }
    setLoading(true)
    setAlert(null)
    try {
      const url = mode === 'edit' ? `/api/admin/produk/${initialData?.id}` : '/api/admin/produk'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, harga: Number(form.harga), umkm_id: Number(form.umkm_id) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data')
      setAlert({ type: 'success', msg: mode === 'edit' ? 'Produk berhasil diperbarui!' : 'Produk berhasil ditambahkan!' })
      setTimeout(() => router.push('/admin/produk'), 1000)
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
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Produk <span className="text-red-500">*</span></label>
          <input type="text" value={form.nama_produk} onChange={(e) => handleNama(e.target.value)} className="input-field" placeholder="Keripik Singkong Original 250gr" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug (URL)</label>
          <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field bg-gray-50" />
          <p className="text-xs text-gray-400 mt-1">Otomatis dari nama produk</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">UMKM <span className="text-red-500">*</span></label>
          <select value={form.umkm_id} onChange={(e) => setForm({ ...form, umkm_id: e.target.value })} className="input-field">
            {umkmList.map((u) => <option key={u.id} value={u.id}>{u.nama_usaha}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Harga (Rp) <span className="text-red-500">*</span></label>
          <input type="number" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} className="input-field" placeholder="15000" min="0" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi <span className="text-red-500">*</span></label>
        <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} className="input-field min-h-[120px] resize-none" placeholder="Deskripsi produk..." />
      </div>

      <ImageUpload
        value={form.foto}
        onChange={(url) => setForm({ ...form, foto: url })}
        folder="produk"
        label="Foto Produk"
        aspect="square"
      />

      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <input type="checkbox" id="is_available" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} className="w-4 h-4 accent-primary-600" />
        <label htmlFor="is_available" className="text-sm font-medium text-gray-700 cursor-pointer">Produk tersedia / stok ada</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={() => router.back()} className="btn-outline px-6">Batal</button>
        <button onClick={handleSubmit} disabled={loading} className="btn-primary px-6 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Produk'}
        </button>
      </div>
    </div>
  )
}
