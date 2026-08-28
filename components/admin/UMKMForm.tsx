'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle, Save, ArrowLeft, Store, Link2, User, Phone, MapPin, Tag, Sparkles } from 'lucide-react'
import { slugify } from '@/lib/utils'
import ImageCropUpload from './ImageCropUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField, FormSection, FormActions } from '@/components/admin/FormField'
import { cn } from '@/lib/utils'

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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNama = (val: string) => {
    setForm({ ...form, nama_usaha: val, slug: slugify(val) })
    if (errors.nama_usaha) setErrors((p) => ({ ...p, nama_usaha: '' }))
  }

  const handleSubmit = async () => {
    const e: Record<string, string> = {}
    if (!form.nama_usaha.trim()) e.nama_usaha = 'Nama usaha wajib diisi'
    if (!form.pemilik.trim()) e.pemilik = 'Nama pemilik wajib diisi'
    if (!form.kategori) e.kategori = 'Kategori wajib dipilih'
    if (!form.deskripsi.trim()) e.deskripsi = 'Deskripsi wajib diisi'
    if (!form.alamat.trim()) e.alamat = 'Alamat wajib diisi'
    if (!form.whatsapp.trim()) e.whatsapp = 'No. WhatsApp wajib diisi'
    else if (!/^62\d{8,}$/.test(form.whatsapp.trim())) e.whatsapp = 'Format 628xxx (tanpa + atau 0)'
    setErrors(e)
    if (Object.keys(e).length > 0) return

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
      window.dispatchEvent(new CustomEvent('admin:mutated'))
      setAlert({ type: 'success', msg: mode === 'edit' ? 'UMKM berhasil diperbarui.' : 'UMKM berhasil ditambahkan.' })
      setTimeout(() => router.push('/admin/umkm'), 900)
    } catch (e: any) {
      setAlert({ type: 'error', msg: e.message })
    }
    setLoading(false)
  }

  return (
    <div className="surface-elevated p-5 md:p-6">
      <div className="flex flex-col gap-5">
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

        <FormSection title="Identitas Usaha" description="Nama dan kategori usaha.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Nama Usaha" required error={errors.nama_usaha} icon={<Store className="size-4" />}>
              <Input
                type="text"
                value={form.nama_usaha}
                onChange={(e) => handleNama(e.target.value)}
                placeholder="Batik Sukobubuk"
                disabled={loading}
              />
            </FormField>
            <FormField label="Slug (URL)" hint="Otomatis dari nama usaha" icon={<Link2 className="size-4" />}>
              <Input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="batik-sukobubuk"
                disabled={loading}
                className="bg-stone-50 font-mono text-xs"
              />
            </FormField>
            <FormField label="Nama Pemilik" required error={errors.pemilik} icon={<User className="size-4" />}>
              <Input
                type="text"
                value={form.pemilik}
                onChange={(e) => {
                  setForm({ ...form, pemilik: e.target.value })
                  if (errors.pemilik) setErrors((p) => ({ ...p, pemilik: '' }))
                }}
                placeholder="Ibu Sari Dewi"
                disabled={loading}
              />
            </FormField>
            <FormField label="Kategori" required error={errors.kategori} icon={<Tag className="size-4" />}>
              <Select
                value={form.kategori}
                onValueChange={(val) => {
                  setForm({ ...form, kategori: val })
                  if (errors.kategori) setErrors((p) => ({ ...p, kategori: '' }))
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Kontak & Lokasi">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label="No. WhatsApp"
              required
              error={errors.whatsapp}
              hint="Format: 628xxx (tanpa + atau 0)"
              icon={<Phone className="size-4" />}
            >
              <Input
                type="text"
                value={form.whatsapp}
                onChange={(e) => {
                  setForm({ ...form, whatsapp: e.target.value })
                  if (errors.whatsapp) setErrors((p) => ({ ...p, whatsapp: '' }))
                }}
                placeholder="628123456789"
                disabled={loading}
              />
            </FormField>
            <FormField label="Alamat" required error={errors.alamat} icon={<MapPin className="size-4" />}>
              <Input
                type="text"
                value={form.alamat}
                onChange={(e) => {
                  setForm({ ...form, alamat: e.target.value })
                  if (errors.alamat) setErrors((p) => ({ ...p, alamat: '' }))
                }}
                placeholder="Jl. Merdeka No. 12"
                disabled={loading}
              />
            </FormField>
          </div>
        </FormSection>

        <FormSection title="Deskripsi & Media">
          <FormField label="Deskripsi" required error={errors.deskripsi}>
            <Textarea
              value={form.deskripsi}
              onChange={(e) => {
                setForm({ ...form, deskripsi: e.target.value })
                if (errors.deskripsi) setErrors((p) => ({ ...p, deskripsi: '' }))
              }}
              placeholder="Ceritakan tentang usaha ini..."
              disabled={loading}
              className="min-h-[100px] resize-none"
            />
          </FormField>

          <ImageCropUpload
            value={form.logo}
            onChange={(url) => setForm({ ...form, logo: url })}
            folder="umkm"
            label="Logo / Foto UMKM"
            aspect="square"
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ember-200 bg-ember-50 p-4">
            <Checkbox
              id="is_featured"
              checked={form.is_featured}
              onCheckedChange={(v) => setForm({ ...form, is_featured: Boolean(v) })}
              disabled={loading}
              className="mt-0.5"
            />
            <span className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-800">
                <Sparkles className="size-3.5 text-ember-600" />
                Tampilkan sebagai UMKM Unggulan
              </span>
              <span className="text-xs text-stone-500">
                UMKM unggulan ditampilkan di beranda dan halaman utama.
              </span>
            </span>
          </label>
        </FormSection>

        <FormActions>
          <Button variant="outline" onClick={() => router.back()} disabled={loading}>
            <ArrowLeft className="size-4" data-icon="inline-start" />
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Save className="size-4" data-icon="inline-start" />
            )}
            {loading ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah UMKM'}
          </Button>
        </FormActions>
      </div>
    </div>
  )
}


