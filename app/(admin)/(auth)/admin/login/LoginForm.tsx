'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Email dan password wajib diisi')
      return
    }

    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Email atau password salah. Silakan coba lagi.')
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            placeholder="admin.desa.sukobubuk@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onKeyDown={handleKeyDown}
            className="input-field pl-10"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            onKeyDown={handleKeyDown}
            className="input-field pl-10 pr-11"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Link href="/admin/lupa-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
          Lupa password?
        </Link>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
        ) : (
          'Masuk ke Dashboard'
        )}
      </button>
    </div>
  )
}
