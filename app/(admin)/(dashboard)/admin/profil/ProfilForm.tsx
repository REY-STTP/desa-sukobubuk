'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle, Building2, Phone, BookOpen, Target, MapPin, Mail, Save } from 'lucide-react'
import { toast } from 'sonner'
import TiptapEditor from '@/components/admin/TiptapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField, FormSection, FormActions } from '@/components/admin/FormField'
import { cn } from '@/lib/utils'

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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const parseMisi = () => {
    try {
      return JSON.parse(initialData?.misi || '[]').join('\n')
    } catch {
      return ''
    }
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

  const set = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }))
    if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }))
  }

  const handleSave = async () => {
    // Light validation per tab
    const e: Record<string, string> = {}
    if (tab === 'identitas') {
      if (!form.nama_desa.trim()) e.nama_desa = 'Nama desa wajib diisi'
      if (!form.nama_kecamatan.trim()) e.nama_kecamatan = 'Kecamatan wajib diisi'
      if (!form.nama_kabupaten.trim()) e.nama_kabupaten = 'Kabupaten wajib diisi'
    }
    if (tab === 'visimisi') {
      if (!form.visi.trim()) e.visi = 'Visi wajib diisi'
    }
    if (Object.keys(e).length > 0) {
      setErrors(e)
      toast.error('Periksa field yang belum lengkap')
      return
    }

    setLoading(true)
    setAlert(null)
    const toastId = toast.loading('Menyimpan profil desa...')
    try {
      const misiArr = form.misi_text
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean)
      const payload = { ...form, misi: JSON.stringify(misiArr), jumlah_penduduk: Number(form.jumlah_penduduk) }

      const res = await fetch('/api/admin/profil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan')
      setAlert({ type: 'success', msg: 'Profil desa berhasil disimpan.' })
      toast.success('Profil desa berhasil disimpan.', { id: toastId })
      router.refresh()
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message })
      toast.error(e.message || 'Gagal menyimpan', { id: toastId })
    }
    setLoading(false)
  }

  return (
    <div className="surface-elevated overflow-hidden">
      {/* Tab header */}
      <div className="flex overflow-x-auto border-b border-stone-200" role="tablist" aria-label="Bagian profil desa">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setTab(t.id)
                setErrors({})
              }}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3.5 text-sm font-medium transition-colors -mb-px',
                active
                  ? 'border-sage-600 bg-sage-50/50 text-sage-700'
                  : 'border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-700'
              )}
            >
              <t.icon className="size-4" data-icon="inline-start" />
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-5 p-5 md:p-6">
        {alert && (
          <div
            role="status"
            className={cn(
              'flex items-center gap-2.5 rounded-xl p-3.5 text-sm',
              alert.type === 'success'
                ? 'border border-sage-200 bg-sage-50 text-sage-800'
                : 'border border-ember-300 bg-ember-50 text-ember-800'
            )}
          >
            {alert.type === 'success' ? (
              <CheckCircle className="size-4 shrink-0 text-sage-600" />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-ember-600" />
            )}
            {alert.msg}
          </div>
        )}

        {/* TAB: Identitas */}
        {tab === 'identitas' && (
          <FormSection title="Identitas Desa" description="Nama, wilayah administratif, dan kode pos.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Nama Desa" required error={errors.nama_desa} icon={<Building2 className="size-4" />}>
                <Input type="text" value={form.nama_desa} onChange={(e) => set('nama_desa', e.target.value)} disabled={loading} />
              </FormField>
              <FormField label="Kecamatan" required error={errors.nama_kecamatan}>
                <Input type="text" value={form.nama_kecamatan} onChange={(e) => set('nama_kecamatan', e.target.value)} disabled={loading} />
              </FormField>
              <FormField label="Kabupaten" required error={errors.nama_kabupaten}>
                <Input type="text" value={form.nama_kabupaten} onChange={(e) => set('nama_kabupaten', e.target.value)} disabled={loading} />
              </FormField>
              <FormField label="Provinsi" icon={<MapPin className="size-4" />}>
                <Input type="text" value={form.nama_provinsi} onChange={(e) => set('nama_provinsi', e.target.value)} disabled={loading} />
              </FormField>
              <FormField label="Kode Pos">
                <Input type="text" value={form.kode_pos} onChange={(e) => set('kode_pos', e.target.value)} disabled={loading} className="font-mono tabular-nums" />
              </FormField>
              <FormField label="Tahun Berdiri">
                <Input type="text" value={form.tahun_berdiri} onChange={(e) => set('tahun_berdiri', e.target.value)} disabled={loading} className="font-mono tabular-nums" placeholder="Contoh: 1925" />
              </FormField>
              <FormField label="Jumlah Penduduk" hint="Angka saja, tanpa titik/koma">
                <Input type="number" value={form.jumlah_penduduk} onChange={(e) => set('jumlah_penduduk', e.target.value)} disabled={loading} className="font-mono tabular-nums" />
              </FormField>
              <FormField label="Periode Visi Misi" hint="Contoh: 2022–2028">
                <Input type="text" value={form.periode_visi_misi} onChange={(e) => set('periode_visi_misi', e.target.value)} disabled={loading} placeholder="2022–2028" />
              </FormField>
            </div>
          </FormSection>
        )}

        {/* TAB: Kontak */}
        {tab === 'kontak' && (
          <FormSection title="Kontak & Lokasi" description="Telepon, email, alamat kantor, dan tautan peta.">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Telepon" icon={<Phone className="size-4" />}>
                <Input type="text" value={form.telepon} onChange={(e) => set('telepon', e.target.value)} disabled={loading} placeholder="(0295) 123456" />
              </FormField>
              <FormField label="Email" icon={<Mail className="size-4" />}>
                <Input type="text" value={form.email} onChange={(e) => set('email', e.target.value)} disabled={loading} placeholder="desa@gmail.com" />
              </FormField>
              <FormField label="WhatsApp" hint="Format: 6281234567890 (tanpa + atau 0)">
                <Input type="text" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} disabled={loading} placeholder="6281234567890" className="font-mono tabular-nums" />
              </FormField>
              <FormField label="Jam Pelayanan">
                <Input type="text" value={form.jam_pelayanan} onChange={(e) => set('jam_pelayanan', e.target.value)} disabled={loading} placeholder="08.00 – 12.00" />
              </FormField>
            </div>
            <FormField label="Alamat Kantor" icon={<MapPin className="size-4" />}>
              <Textarea value={form.alamat_kantor} onChange={(e) => set('alamat_kantor', e.target.value)} disabled={loading} className="min-h-[80px] resize-none" />
            </FormField>
            <FormField label="Google Maps — Embed URL" hint='Buka Google Maps → Bagikan → Sematkan peta → Salin URL dari src="..."'>
              <Textarea
                value={form.maps_embed_url}
                onChange={(e) => set('maps_embed_url', e.target.value)}
                disabled={loading}
                className="min-h-[80px] resize-none font-mono text-xs"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </FormField>
            <FormField label="Google Maps — Link">
              <Input type="text" value={form.maps_link} onChange={(e) => set('maps_link', e.target.value)} disabled={loading} placeholder="https://maps.google.com/?q=..." />
            </FormField>
          </FormSection>
        )}

        {/* TAB: Sejarah */}
        {tab === 'sejarah' && (
          <FormSection title="Konten Sejarah" description="Gunakan toolbar untuk memformat teks.">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700">Sejarah Desa</label>
              <div className="rounded-xl border border-stone-200">
                <TiptapEditor
                  value={form.sejarah_konten}
                  onChange={(html) => set('sejarah_konten', html)}
                  placeholder="Tulis sejarah desa di sini..."
                />
              </div>
            </div>
          </FormSection>
        )}

        {/* TAB: Visi Misi */}
        {tab === 'visimisi' && (
          <FormSection title="Visi & Misi" description="Visi adalah kalimat tunggal; misi satu baris per poin.">
            <FormField label="Visi" required error={errors.visi} hint="Satu kalimat visi utama">
              <Textarea
                value={form.visi}
                onChange={(e) => set('visi', e.target.value)}
                disabled={loading}
                className="min-h-[96px] resize-none"
                placeholder="Terwujudnya Desa ... yang ..."
              />
            </FormField>
            <FormField label="Misi" hint="Satu baris = satu poin misi">
              <Textarea
                value={form.misi_text}
                onChange={(e) => set('misi_text', e.target.value)}
                disabled={loading}
                className="min-h-[200px] resize-y"
                placeholder={`Meningkatkan kualitas pelayanan...${'\n'}Mengembangkan potensi SDM...${'\n'}dst.`}
              />
            </FormField>
          </FormSection>
        )}

        <FormActions>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Save className="size-4" data-icon="inline-start" />
            )}
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </FormActions>
      </div>
    </div>
  )
}
