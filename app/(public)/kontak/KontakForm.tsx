'use client'

import { useState, useTransition } from 'react'
import { Send, CheckCircle, AlertCircle, Loader2, Mail, User, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface FormErrors {
  nama?: string
  email?: string
  isi_pesan?: string
}

export default function KontakForm() {
  const [form, setForm] = useState({ nama: '', email: '', isi_pesan: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isPending, startTransition] = useTransition()

  function validate(): FormErrors {
    const e: FormErrors = {}
    if (!form.nama.trim()) e.nama = 'Nama wajib diisi'
    else if (form.nama.trim().length < 2) e.nama = 'Nama minimal 2 karakter'

    if (!form.email.trim()) e.email = 'Email wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Format email tidak valid'

    if (!form.isi_pesan.trim()) e.isi_pesan = 'Pesan wajib diisi'
    else if (form.isi_pesan.trim().length < 10)
      e.isi_pesan = 'Pesan minimal 10 karakter'

    return e
  }

  const handleSubmit = async (e?: React.FormEvent) => {
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

    startTransition(async () => {
      try {
        const res = await fetch('/api/pesan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })

        if (!res.ok) throw new Error('Gagal mengirim pesan')

        setStatus('success')
        setForm({ nama: '', email: '', isi_pesan: '' })
        setErrors({})
      } catch {
        setStatus('error')
        setErrorMsg('Gagal mengirim pesan. Silakan coba lagi.')
      }
    })
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    // Clear field error when user types
    if (errors[field]) {
      setErrors((e) => {
        const next = { ...e }
        delete next[field]
        return next
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-elevated p-6 md:p-8"
      noValidate
    >
      <div className="mb-6">
        <h2 className="font-display text-2xl font-medium text-stone-800 mb-1.5">
          Kirim Pesan
        </h2>
        <p className="text-sm text-stone-500">
          Isi form berikut dan kami akan merespons sesegera mungkin.
        </p>
      </div>

      {/* Status alerts */}
      {status === 'success' && (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-sage-200 bg-sage-50 p-4 animate-in fade-in slide-in-from-top-2"
        >
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-sage-600 text-white">
            <CheckCircle className="size-4" />
          </div>
          <div>
            <p className="font-semibold text-sage-800">Pesan berhasil dikirim</p>
            <p className="mt-0.5 text-sm text-sage-700">
              Kami akan segera merespons pesan Anda lewat email.
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
        {/* Nama */}
        <div>
          <label
            htmlFor="nama"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700"
          >
            <User className="size-3.5 text-stone-400" />
            Nama Lengkap
            <span className="text-ember-600">*</span>
          </label>
          <Input
            id="nama"
            type="text"
            placeholder="Masukkan nama lengkap Anda"
            value={form.nama}
            onChange={(e) => handleChange('nama', e.target.value)}
            disabled={status === 'loading'}
            aria-invalid={!!errors.nama}
            aria-describedby={errors.nama ? 'nama-error' : undefined}
            className={cn(
              errors.nama &&
                'border-stone-400 ring-1 ring-stone-300 focus-visible:ring-stone-400/40'
            )}
          />
          {errors.nama && (
            <p id="nama-error" className="mt-1 text-xs text-stone-600">
              {errors.nama}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700"
          >
            <Mail className="size-3.5 text-stone-400" />
            Email
            <span className="text-ember-600">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="nama@email.com"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            disabled={status === 'loading'}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={cn(
              errors.email &&
                'border-stone-400 ring-1 ring-stone-300 focus-visible:ring-stone-400/40'
            )}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-stone-600">
              {errors.email}
            </p>
          )}
        </div>

        {/* Pesan */}
        <div>
          <label
            htmlFor="isi_pesan"
            className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-700"
          >
            <MessageSquare className="size-3.5 text-stone-400" />
            Pesan
            <span className="text-ember-600">*</span>
          </label>
          <Textarea
            id="isi_pesan"
            placeholder="Tulis pesan, pertanyaan, atau masukan Anda..."
            value={form.isi_pesan}
            onChange={(e) => handleChange('isi_pesan', e.target.value)}
            rows={6}
            disabled={status === 'loading'}
            aria-invalid={!!errors.isi_pesan}
            aria-describedby={
              errors.isi_pesan ? 'isi_pesan-error' : undefined
            }
            className={cn(
              'resize-none',
              errors.isi_pesan &&
                'border-stone-400 ring-1 ring-stone-300 focus-visible:ring-stone-400/40'
            )}
          />
          {errors.isi_pesan && (
            <p
              id="isi_pesan-error"
              className="mt-1 text-xs text-stone-600"
            >
              {errors.isi_pesan}
            </p>
          )}
          <p className="mt-1 text-xs text-stone-400">
            {form.isi_pesan.length} karakter
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={status === 'loading'}
          className="w-full"
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="size-4" data-icon="inline-start" />
              Kirim Pesan
            </>
          )}
        </Button>

        <p className="text-xs text-stone-400 text-center">
          Dengan mengirim pesan, Anda setuju data Anda diproses untuk
          keperluan komunikasi desa.
        </p>
      </div>
    </form>
  )
}
