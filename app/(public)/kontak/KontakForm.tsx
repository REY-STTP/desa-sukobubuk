'use client'

import { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function KontakForm() {
  const [form, setForm] = useState({ nama: '', email: '', isi_pesan: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async () => {
    if (!form.nama || !form.email || !form.isi_pesan) {
      setErrorMsg('Semua field wajib diisi')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/pesan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Gagal mengirim pesan')

      setStatus('success')
      setForm({ nama: '', email: '', isi_pesan: '' })
    } catch {
      setStatus('error')
      setErrorMsg('Gagal mengirim pesan. Silakan coba lagi.')
    }
  }

  return (
    <div className="card p-8">
      <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Kirim Pesan</h2>
      <p className="text-gray-500 text-sm mb-8">Isi form berikut dan kami akan merespons sesegera mungkin.</p>

      {status === 'success' && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-800">Pesan berhasil dikirim!</p>
            <p className="text-sm text-green-600">Kami akan segera merespons pesan Anda.</p>
          </div>
        </div>
      )}

      {status === 'error' && errorMsg && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Masukkan nama lengkap Anda"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="input-field"
            disabled={status === 'loading'}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="nama@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field"
            disabled={status === 'loading'}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Pesan <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Tulis pesan, pertanyaan, atau masukan Anda..."
            value={form.isi_pesan}
            onChange={(e) => setForm({ ...form, isi_pesan: e.target.value })}
            rows={6}
            className="input-field resize-none"
            disabled={status === 'loading'}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={status === 'loading'}
          className="btn-primary w-full justify-center py-4 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Kirim Pesan
            </>
          )}
        </button>
      </div>
    </div>
  )
}
