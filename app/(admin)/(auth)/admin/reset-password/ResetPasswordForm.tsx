'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

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
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="font-semibold text-gray-900">Link Tidak Valid</p>
        <p className="text-sm text-gray-500 mt-1 mb-4">Token reset password tidak ditemukan atau sudah kadaluarsa.</p>
        <Link href="/admin/lupa-password" className="btn-primary">Minta Link Baru</Link>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!form.password || !form.konfirmasi) { setMessage('Semua field wajib diisi'); setStatus('error'); return }
    if (form.password.length < 8) { setMessage('Password minimal 8 karakter'); setStatus('error'); return }
    if (form.password !== form.konfirmasi) { setMessage('Konfirmasi password tidak cocok'); setStatus('error'); return }

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal reset password')
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Terjadi kesalahan.')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <p className="font-semibold text-gray-900 mb-2">Password Berhasil Diubah!</p>
        <p className="text-sm text-gray-500 mb-5">Silakan login dengan password baru Anda.</p>
        <Link href="/admin/login" className="btn-primary">Pergi ke Halaman Login</Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {status === 'error' && message && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password Baru</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={show.password ? 'text' : 'password'}
            placeholder="Minimal 8 karakter"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field pl-10 pr-11"
            disabled={status === 'loading'}
          />
          <button type="button" onClick={() => setShow({ ...show, password: !show.password })}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Konfirmasi Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={show.konfirmasi ? 'text' : 'password'}
            placeholder="Ulangi password baru"
            value={form.konfirmasi}
            onChange={(e) => setForm({ ...form, konfirmasi: e.target.value })}
            className="input-field pl-10 pr-11"
            disabled={status === 'loading'}
          />
          <button type="button" onClick={() => setShow({ ...show, konfirmasi: !show.konfirmasi })}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show.konfirmasi ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button onClick={handleSubmit} disabled={status === 'loading'}
        className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed">
        {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : 'Simpan Password Baru'}
      </button>
    </div>
  )
}
