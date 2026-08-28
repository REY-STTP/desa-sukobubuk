'use client'

import { useState } from 'react'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LupaPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    if (!email) { setMessage('Email wajib diisi'); setStatus('error'); return }

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Gagal mengirim email')

      setStatus('success')
      setMessage('Link reset password telah dikirim ke email Anda. Silakan cek inbox atau folder spam.')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Terjadi kesalahan. Coba lagi.')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="size-14 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="size-7 text-sage-600" />
        </div>
        <p className="font-semibold text-stone-800 mb-2">Email Terkirim!</p>
        <p className="text-sm text-stone-500 leading-relaxed">{message}</p>
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
        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email Admin</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
          <Input
            type="email"
            placeholder="admin.desa.sukobubuk@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="pl-10"
            disabled={status === 'loading'}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={status === 'loading'}
        className="w-full py-3 disabled:opacity-60"
      >
        {status === 'loading' ? (
          <><Loader2 className="size-4 animate-spin" data-icon="inline-start" /> Mengirim...</>
        ) : (
          'Kirim Link Reset Password'
        )}
      </Button>
    </div>
  )
}
