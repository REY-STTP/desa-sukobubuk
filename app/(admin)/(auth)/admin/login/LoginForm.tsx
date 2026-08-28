'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!form.email || !form.password) {
      setError('Email dan password wajib diisi')
      toast.error('Email dan password wajib diisi')
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
      toast.error('Email atau password salah. Silakan coba lagi.')
    } else {
      toast.success('Login berhasil, mengarahkan ke dashboard...')
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-stone-300 bg-stone-100 p-3.5 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-stone-700" />
          <span className="text-stone-800">{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium text-stone-700"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            id="email"
            type="email"
            placeholder="admin.desa.sukobubuk@gmail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={loading}
            className="h-10 pl-10"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-sm font-medium text-stone-700"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
            className="h-10 pl-10 pr-11"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-700"
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/admin/lupa-password"
          className="text-sm font-medium text-sage-700 transition-colors hover:text-sage-800"
        >
          Lupa password?
        </Link>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="mt-1 w-full"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            Memproses...
          </>
        ) : (
          <>
            Masuk ke Dashboard
            <ArrowRight className="size-4" data-icon="inline-end" />
          </>
        )}
      </Button>
    </form>
  )
}
