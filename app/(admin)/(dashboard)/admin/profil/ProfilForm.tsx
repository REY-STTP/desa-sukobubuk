'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle, Building2, Phone, BookOpen, Target } from 'lucide-react'
import TiptapEditor from '@/components/admin/TiptapEditor'

const TABS = [
  { id: 'identitas', label: 'Identitas Desa', icon: Building2 },
  { id: 'kontak', label: 'Kontak & Lokasi', icon: Phone },
  { id: 'sejarah', label: 'Sejarah', icon: BookOpen },
  { id: 'visimisi', label: 'Visi & Misi', icon: Target },
]

export default function ProfilForm({ initialData }: { initialData: any }) {
  const router = useRouter()
  const [tab, setTab] = useState('identitas')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const parseMisi = () => {
    try { return JSON.parse(initialData?.misi || '[]').join('\n') } catch { return '' }
  }

  const [form, setForm] = useState({
    nama_desa: initialData?.nama_desa ?? 'Desa Sukobubuk',
    nama_kecamatan: initialData?.nama_kecamatan ?? '',
    nama_kabupaten: initialData?.nama_kabupaten ?? '',
    nama_provinsi: initialData?.nama_provinsi ?? '',
    kode_pos: initialData?.kode_pos ?? '',
    jumlah_penduduk: initialData?.jumlah_penduduk?.toString() ?? '3500',
    tahun_berdiri: initialData?.tahun_berdiri ?? '',
    alamat_kantor: initialData?.alamat_kantor ?? '',
    telepon: initialData?.telepon ?? '',
    email: initialData?.email ?? '',
    whatsapp: initialData?.whatsapp ?? '',
    jam_pelayanan: initialData?.jam_pelayanan ?? '08.00 – 12.00',
    maps_embed_url: initialData?.maps_embed_url ?? '',
    maps_link: initialData?.maps_link ?? '',
    sejarah_konten: initialData?.sejarah_konten ?? '',
    visi: initialData?.visi ?? '',
    misi_text: parseMisi(),
    periode_visi_misi: initialData?.periode_visi_misi ?? '2022–2028',
  })

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    setLoading(true)
    setAlert(null)
    try {
      const misiArr = form.misi_text.split('\n').map((s: string) => s.trim()).filter(Boolean)
      const payload = { ...form, misi: JSON.stringify(misiArr), jumlah_penduduk: Number(form.jumlah_penduduk) }

      const res = await fetch('/api/admin/profil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan')
      setAlert({ type: 'success', msg: 'Profil desa berhasil disimpan!' })
      router.refresh()
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message })
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Tab header */}
      <div className="flex overflow-x-auto border-b border-gray-100">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${tab === t.id ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <t.icon className="w-4 h-4" />{t.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-5">
        {alert && (
          <div className={`flex items-center gap-2.5 rounded-xl p-3.5 text-sm ${alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {alert.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {alert.msg}
          </div>
        )}

        {/* TAB: Identitas */}
        {tab === 'identitas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { key: 'nama_desa', label: 'Nama Desa' },
              { key: 'nama_kecamatan', label: 'Kecamatan' },
              { key: 'nama_kabupaten', label: 'Kabupaten' },
              { key: 'nama_provinsi', label: 'Provinsi' },
              { key: 'kode_pos', label: 'Kode Pos' },
              { key: 'tahun_berdiri', label: 'Tahun Berdiri' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                <input type="text" value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} className="input-field" />
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jumlah Penduduk</label>
              <input type="number" value={form.jumlah_penduduk} onChange={e => set('jumlah_penduduk', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Periode Visi Misi</label>
              <input type="text" value={form.periode_visi_misi} onChange={e => set('periode_visi_misi', e.target.value)} className="input-field" placeholder="2022–2028" />
            </div>
          </div>
        )}

        {/* TAB: Kontak */}
        {tab === 'kontak' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { key: 'telepon', label: 'Telepon', placeholder: '(0295) 123456' },
                { key: 'email', label: 'Email', placeholder: 'desa@gmail.com' },
                { key: 'whatsapp', label: 'WhatsApp (tanpa + atau 0)', placeholder: '6281234567890' },
                { key: 'jam_pelayanan', label: `Jam Pelayanan Jum'at`, placeholder: '08.00 – 12.00' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{f.label}</label>
                  <input type="text" value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} className="input-field" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alamat Kantor</label>
              <textarea value={form.alamat_kantor} onChange={e => set('alamat_kantor', e.target.value)} className="input-field resize-none h-20" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Google Maps – Embed URL</label>
              <textarea value={form.maps_embed_url} onChange={e => set('maps_embed_url', e.target.value)} className="input-field resize-none h-20 font-mono text-xs" placeholder="https://www.google.com/maps/embed?pb=..." />
              <p className="text-xs text-gray-400 mt-1">Buka Google Maps → Bagikan → Sematkan peta → Salin URL dari src="..."</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Google Maps – Link</label>
              <input type="text" value={form.maps_link} onChange={e => set('maps_link', e.target.value)} className="input-field" placeholder="https://maps.google.com/?q=..." />
            </div>
          </div>
        )}

        {/* TAB: Sejarah */}
        {tab === 'sejarah' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Konten Sejarah</label>
            <TiptapEditor
              value={form.sejarah_konten}
              onChange={(html) => set('sejarah_konten', html)}
              placeholder="Tulis sejarah desa di sini..."
            />
            <p className="text-xs text-gray-400 mt-1">
              Gunakan toolbar di atas untuk memformat teks — bold, italic, heading, list, dan lainnya.
            </p>
          </div>
        )}

        {/* TAB: Visi Misi */}
        {tab === 'visimisi' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Visi</label>
              <textarea value={form.visi} onChange={e => set('visi', e.target.value)} className="input-field resize-none h-24" placeholder="Terwujudnya Desa ... yang ..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Misi</label>
              <textarea
                value={form.misi_text}
                onChange={e => set('misi_text', e.target.value)}
                className="input-field min-h-[200px] resize-y"
                placeholder="Tulis setiap poin misi di baris baru:&#10;Meningkatkan kualitas pelayanan...&#10;Mengembangkan potensi SDM...&#10;dst."
              />
              <p className="text-xs text-gray-400 mt-1">Satu baris = satu poin misi. Tekan Enter untuk baris baru.</p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button onClick={handleSave} disabled={loading} className="btn-primary px-6 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}