'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle, Save, ArrowLeft, FileText, Link2 } from 'lucide-react'
import { slugify } from '@/lib/utils'
import ImageCropUpload from './ImageCropUpload'
import TiptapEditor from './TiptapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField, FormSection, FormActions } from '@/components/admin/FormField'
import { cn } from '@/lib/utils'

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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleJudul = (val: string) => {
    setForm({ ...form, judul: val, slug: slugify(val) })
    if (errors.judul) setErrors((p) => ({ ...p, judul: '' }))
  }

  const handleSubmit = async () => {
    const e: Record<string, string> = {}
    if (!form.judul.trim()) e.judul = 'Judul wajib diisi'
    if (!form.konten || form.konten === '<p></p>' || !form.konten.trim()) e.konten = 'Konten wajib diisi'
    setErrors(e)
    if (Object.keys(e).length > 0) return

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
      window.dispatchEvent(new CustomEvent('admin:mutated'))
      setAlert({ type: 'success', msg: mode === 'edit' ? 'Berita berhasil diperbarui.' : 'Berita berhasil dipublish.' })
      setTimeout(() => router.push('/admin/berita'), 900)
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

        <FormSection title="Informasi Berita" description="Lengkapi judul, thumbnail, dan isi berita.">
          <FormField
            label="Judul Berita"
            required
            error={errors.judul}
            hint="Judul yang jelas dan ringkas"
            icon={<FileText className="size-4" />}
          >
            <Input
              type="text"
              value={form.judul}
              onChange={(e) => handleJudul(e.target.value)}
              placeholder="Judul berita yang menarik..."
              disabled={loading}
            />
          </FormField>

          <FormField
            label="Slug (URL)"
            hint="Otomatis dari judul — bisa diedit manual"
            icon={<Link2 className="size-4" />}
          >
            <Input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="judul-berita"
              disabled={loading}
              className="bg-stone-50 font-mono text-xs"
            />
          </FormField>

          <ImageCropUpload
            value={form.thumbnail}
            onChange={(url) => setForm({ ...form, thumbnail: url })}
            folder="berita"
            label="Thumbnail / Gambar Utama"
            aspect="video"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">
              Konten Berita <span className="text-ember-600">*</span>
            </label>
            <div
              className={cn(
                'rounded-xl border',
                errors.konten ? 'border-ember-500 ring-1 ring-ember-500/20' : 'border-stone-200'
              )}
            >
              <TiptapEditor
                value={form.konten}
                onChange={(html) => {
                  setForm({ ...form, konten: html })
                  if (errors.konten) setErrors((p) => ({ ...p, konten: '' }))
                }}
                placeholder="Tulis konten berita di sini..."
              />
            </div>
            {errors.konten ? (
              <p className="flex items-center gap-1.5 text-xs text-ember-700">
                <AlertCircle className="size-3" />
                {errors.konten}
              </p>
            ) : (
              <p className="text-xs text-stone-500">
                Gunakan toolbar di atas untuk memformat: bold, italic, heading, list, dll.
              </p>
            )}
          </div>
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
            {loading ? 'Menyimpan...' : mode === 'edit' ? 'Simpan Perubahan' : 'Publish Berita'}
          </Button>
        </FormActions>
      </div>
    </div>
  )
}
