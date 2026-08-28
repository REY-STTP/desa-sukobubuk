'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [form, setForm] = useState({ password: '', konfirmasi: '' })
  const [show, setShow] = useState({ password: false, konfirmasi: false })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  if (!token) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="size-12 text-red-500 mx-auto mb-3" />
        <p className="font-semibold text-stone-800">Link Tidak Valid</p>
        <p className="text-sm text-stone-500 mt-1 mb-4">Token reset password tidak ditemukan atau sudah kadaluarsa.</p>
        <Link href="/admin/lupa-password" className="btn-primary">Minta Link Baru</Link>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!form.password || !form.konfirmasi) {
      setMessage('Semua field wajib diisi')
      setStatus('error')
      toast.error('Semua field wajib diisi')
      return
    }
    if (form.password.length < 8) {
      setMessage('Password minimal 8 karakter')
      setStatus('error')
      toast.error('Password minimal 8 karakter')
      return
    }
    if (form.password !== form.konfirmasi) {
      setMessage('Konfirmasi password tidak cocok')
      setStatus('error')
      toast.error('Konfirmasi password tidak cocok')
      return
    }

    setStatus('loading')
    setMessage('')

    const toastId = toast.loading('Menyimpan password baru...')
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal reset password')
      setStatus('success')
      toast.success('Password berhasil diubah!', { id: toastId })
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Terjadi kesalahan.')
      toast.error(err.message || 'Terjadi kesalahan.', { id: toastId })
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="size-14 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="size-7 text-sage-600" />
        </div>
        <p className="font-semibold text-stone-800 mb-2">Password Berhasil Diubah!</p>
        <p className="text-sm text-stone-500 mb-5">Silakan login dengan password baru Anda.</p>
        <Link href="/admin/login" className="btn-primary">Pergi ke Halaman Login</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {status === 'error' && message && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm">
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password Baru</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
          <input
            type={show.password ? 'text' : 'password'}
            placeholder="Minimal 8 karakter"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field pl-10 pr-11"
            disabled={status === 'loading'}
          />
          <button type="button" onClick={() => setShow({ ...show, password: !show.password })}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
            {show.password ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Konfirmasi Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
          <input
            type={show.konfirmasi ? 'text' : 'password'}
            placeholder="Ulangi password baru"
            value={form.konfirmasi}
            onChange={(e) => setForm({ ...form, konfirmasi: e.target.value })}
            className="input-field pl-10 pr-11"
            disabled={status === 'loading'}
          />
          <button type="button" onClick={() => setShow({ ...show, konfirmasi: !show.konfirmasi })}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
            {show.konfirmasi ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={status === 'loading'}
        className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed">
        {status === 'loading' ? <><Loader2 className="size-4 animate-spin" /> Menyimpan...</> : 'Simpan Password Baru'}
      </button>
    </div>
  )
}
