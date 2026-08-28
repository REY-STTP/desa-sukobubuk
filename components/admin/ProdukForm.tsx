'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle, Save, ArrowLeft, Package, Link2, Store, Tag, DollarSign, Check } from 'lucide-react'
import { slugify } from '@/lib/utils'
import ImageCropUpload from './ImageCropUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FormField, FormSection, FormActions } from '@/components/admin/FormField'
import { cn } from '@/lib/utils'

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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleNama = (val: string) => {
    setForm({ ...form, nama_produk: val, slug: slugify(val) })
    if (errors.nama_produk) setErrors((p) => ({ ...p, nama_produk: '' }))
  }

  const handleSubmit = async () => {
    const e: Record<string, string> = {}
    if (!form.nama_produk.trim()) e.nama_produk = 'Nama produk wajib diisi'
    if (!form.deskripsi.trim()) e.deskripsi = 'Deskripsi wajib diisi'
    if (!form.harga.trim()) e.harga = 'Harga wajib diisi'
    else if (isNaN(Number(form.harga)) || Number(form.harga) <= 0) e.harga = 'Harga harus angka valid > 0'
    if (!form.umkm_id) e.umkm_id = 'Pilih UMKM pemilik produk'
    setErrors(e)
    if (Object.keys(e).length > 0) return

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
      window.dispatchEvent(new CustomEvent('admin:mutated'))
      setAlert({ type: 'success', msg: mode === 'edit' ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.' })
      setTimeout(() => router.push('/admin/produk'), 900)
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

        <FormSection title="Informasi Produk" description="Lengkapi data produk untuk katalog UMKM.">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Nama Produk" required error={errors.nama_produk} icon={<Package className="size-4" />}>
              <Input
                type="text"
                value={form.nama_produk}
                onChange={(e) => handleNama(e.target.value)}
                placeholder="Keripik Singkong Original 250gr"
                disabled={loading}
              />
            </FormField>
            <FormField label="Slug (URL)" hint="Otomatis dari nama produk" icon={<Link2 className="size-4" />}>
              <Input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="keripik-singkong-original-250gr"
                disabled={loading}
                className="bg-stone-50 font-mono text-xs"
              />
            </FormField>
            <FormField label="UMKM" required error={errors.umkm_id} icon={<Store className="size-4" />}>
              <Select
                value={form.umkm_id}
                onValueChange={(val) => {
                  setForm({ ...form, umkm_id: val })
                  if (errors.umkm_id) setErrors((p) => ({ ...p, umkm_id: '' }))
                }}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih UMKM" />
                </SelectTrigger>
                <SelectContent>
                  {umkmList.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.nama_usaha}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Harga (Rp)" required error={errors.harga} icon={<DollarSign className="size-4" />}>
              <Input
                type="number"
                value={form.harga}
                onChange={(e) => {
                  setForm({ ...form, harga: e.target.value })
                  if (errors.harga) setErrors((p) => ({ ...p, harga: '' }))
                }}
                placeholder="15000"
                min="0"
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
              placeholder="Deskripsi produk — bahan, varian, cara pemesanan..."
              disabled={loading}
              className="min-h-[100px] resize-none"
            />
          </FormField>

          <ImageCropUpload
            value={form.foto}
            onChange={(url) => setForm({ ...form, foto: url })}
            folder="produk"
            label="Foto Produk"
            aspect="square"
          />

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-sage-200 bg-sage-50 p-4">
            <Checkbox
              id="is_available"
              checked={form.is_available}
              onCheckedChange={(v) => setForm({ ...form, is_available: Boolean(v) })}
              disabled={loading}
              className="mt-0.5"
            />
            <span className="flex flex-col gap-0.5">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-800">
                <Check className="size-3.5 text-sage-600" />
                Produk tersedia / stok ada
              </span>
              <span className="text-xs text-stone-500">
                Nonaktifkan jika produk sedang habis atau tidak dijual.
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
            {loading ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Produk'}
          </Button>
        </FormActions>
      </div>
    </div>
  )
}
