'use client'

import { useState, useTransition } from 'react'
import { Send, CheckCircle, AlertCircle, Loader2, User, Star, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import RatingStars from './RatingStars'

// TASK-REV-01 — form ulasan publik. Island client, meniru
// `app/(public)/kontak/KontakForm.tsx`: useState + useTransition,
// fetch POST JSON, validasi klien cermin server, petakan `issues`
// server per-field, bedakan 429 via header Retry-After.
// Ulasan masuk sebagai pending (moderasi admin) — pesan sukses
// menyatakan itu agar pengirim tak bingung ulasannya belum tampil.

type Status = 'idle' | 'loading' | 'success' | 'error'

interface FormErrors {
  nama?: string
  rating?: string
  komentar?: string
}

export default function UlasanForm({ produkId }: { produkId: number }) {
  const [form, setForm] = useState({ nama: '', rating: 0, komentar: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isPending, startTransition] = useTransition()

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!form.nama.trim()) e.nama = 'Nama wajib diisi'
    else if (form.nama.trim().length > 100) e.nama = 'Nama maksimal 100 karakter'

    if (!form.rating || form.rating < 1 || form.rating > 5)
      e.rating = 'Pilih rating 1–5 bintang'

    if (!form.komentar.trim()) e.komentar = 'Ulasan wajib diisi'
    else if (form.komentar.trim().length < 10)
      e.komentar = 'Ulasan minimal 10 karakter'
    else if (form.komentar.trim().length > 1000)
      e.komentar = 'Ulasan maksimal 1000 karakter'

    return e
  }

  const handleSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    const v = validate()
    setErrors(v)
    if (Object.keys(v).length > 0) {
      setStatus('error')
      setErrorMsg('Periksa kembali isian Anda')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    // Honeypot dibaca dari DOM (uncontrolled) agar selalu terkirim apa adanya.
    const website =
      e?.currentTarget instanceof HTMLFormElement
        ? String(new FormData(e.currentTarget).get('website') ?? '')
        : ''

    startTransition(async () => {
      try {
        const res = await fetch('/api/ulasan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            produk_id: produkId,
            nama: form.nama.trim(),
            rating: form.rating,
            komentar: form.komentar.trim(),
            website,
          }),
        })

        if (!res.ok) {
          let msg = 'Gagal mengirim ulasan. Silakan coba lagi.'
          if (res.status === 429) {
            const retry = res.headers.get('Retry-After')
            msg = retry
              ? `Terlalu sering mengirim. Coba lagi dalam ${Math.ceil(Number(retry) / 60)} menit.`
              : 'Terlalu sering mengirim. Coba lagi nanti.'
          } else {
            try {
              const data = (await res.clone().json()) as {
                error?: string
                issues?: Array<{ path?: string | Array<string | number>; message?: string }>
              }
              const fieldErrors: FormErrors = {}
              for (const issue of data.issues ?? []) {
                const rawPath = issue.path
                const key = (
                  typeof rawPath === 'string' ? rawPath.split('.')[0] : rawPath?.[0]
                ) as string | undefined
                if (
                  (key === 'nama' || key === 'rating' || key === 'komentar') &&
                  issue.message &&
                  !fieldErrors[key]
                ) {
                  fieldErrors[key] = issue.message
                }
              }
              if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors)
                msg = 'Periksa kembali isian Anda'
              } else if (data.error) {
                msg = data.error
              }
            } catch {
              // Bukan JSON — pakai pesan generik.
            }
          }
          throw new Error(msg)
        }

        setStatus('success')
        setForm({ nama: '', rating: 0, komentar: '' })
        setErrors({})
      } catch (e) {
        setStatus('error')
        setErrorMsg(e instanceof Error ? e.message : 'Gagal mengirim ulasan. Silakan coba lagi.')
      }
    })
  }

  const loading = status === 'loading' || isPending

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-elevated p-6 md:p-8"
      noValidate
      aria-label="Form tulis ulasan"
    >
      <div className="mb-6">
        <h3 className="font-display text-xl font-medium text-stone-800 mb-1.5">
          Tulis Ulasan
        </h3>
        <p className="text-sm text-stone-500">
          Bagikan pengalaman Anda memakai produk ini. Ulasan tampil setelah disetujui admin.
        </p>
      </div>

      {status === 'success' && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-sage-200 bg-sage-50 p-4 animate-in fade-in slide-in-from-top-2"
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage-600 text-white">
            <CheckCircle className="size-4" />
          </div>
          <div>
            <p className="font-semibold text-sage-800">Ulasan terkirim</p>
            <p className="mt-0.5 text-sm text-sage-700">
              Terima kasih! Ulasan Anda akan tampil setelah disetujui admin.
            </p>
          </div>
        </div>
      )}

      {status === 'error' && errorMsg && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-stone-300 bg-stone-100 p-4"
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-stone-700 text-white">
            <AlertCircle className="size-4" />
          </div>
          <div>
            <p className="font-semibold text-stone-800">{errorMsg}</p>
            {Object.keys(errors).length > 0 && (
              <p className="mt-0.5 text-sm text-stone-600">
                Periksa field yang ditandai di bawah.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div>
          <span
            id="rating-label"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700"
          >
            <Star className="size-3.5 text-stone-400" />
            Rating
            <span className="text-ember-600">*</span>
          </span>
          <RatingStars
            mode="input"
            value={form.rating}
            disabled={loading}
            onChange={(v) => {
              setForm((f) => ({ ...f, rating: v }))
              if (errors.rating) {
                setErrors((e) => {
                  const next = { ...e }
                  delete next.rating
                  return next
                })
              }
            }}
          />
          {errors.rating && (
            <p role="alert" className="mt-1 text-xs font-medium text-destructive">
              {errors.rating}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="ulasan-nama"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700"
          >
            <User className="size-3.5 text-stone-400" />
            Nama
            <span className="text-ember-600">*</span>
          </label>
          <Input
            id="ulasan-nama"
            type="text"
            placeholder="Nama Anda"
            value={form.nama}
            maxLength={100}
            onChange={(e) => {
              setForm((f) => ({ ...f, nama: e.target.value }))
              if (errors.nama) {
                setErrors((prev) => {
                  const next = { ...prev }
                  delete next.nama
                  return next
                })
              }
            }}
            disabled={loading}
            aria-invalid={!!errors.nama}
            aria-describedby={errors.nama ? 'ulasan-nama-error' : undefined}
            className={cn(
              errors.nama &&
                'border-destructive ring-1 ring-destructive/40 focus-visible:ring-destructive/50'
            )}
          />
          {errors.nama && (
            <p id="ulasan-nama-error" className="mt-1 text-xs font-medium text-destructive">
              {errors.nama}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="ulasan-komentar"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700"
          >
            <MessageSquare className="size-3.5 text-stone-400" />
            Ulasan
            <span className="text-ember-600">*</span>
          </label>
          <Textarea
            id="ulasan-komentar"
            placeholder="Ceritakan pengalaman Anda (minimal 10 karakter)..."
            value={form.komentar}
            maxLength={1000}
            onChange={(e) => {
              setForm((f) => ({ ...f, komentar: e.target.value }))
              if (errors.komentar) {
                setErrors((prev) => {
                  const next = { ...prev }
                  delete next.komentar
                  return next
                })
              }
            }}
            rows={4}
            disabled={loading}
            aria-invalid={!!errors.komentar}
            aria-describedby={errors.komentar ? 'ulasan-komentar-error' : undefined}
            className={cn(
              'resize-none',
              errors.komentar &&
                'border-destructive ring-1 ring-destructive/40 focus-visible:ring-destructive/50'
            )}
          />
          {errors.komentar && (
            <p id="ulasan-komentar-error" className="mt-1 text-xs font-medium text-destructive">
              {errors.komentar}
            </p>
          )}
          <p className="mt-1 text-xs text-stone-400">
            {form.komentar.length}/1000 karakter
          </p>
        </div>

        {/* Honeypot anti-bot: manusia tak melihat/mengisi; bot yang mengisi ditolak diam-diam. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0">
          <label htmlFor="website">Jangan isi kolom ini</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="size-4" data-icon="inline-start" />
              Kirim Ulasan
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
