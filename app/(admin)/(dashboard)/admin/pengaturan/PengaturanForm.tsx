'use client'

import { useState } from 'react'
import { User, Mail, Lock, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Save } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField, FormSection, FormActions } from '@/components/admin/FormField'

type Tab = 'profil' | 'email' | 'password'

interface UserData {
  id: number
  name: string
  email: string
  role: string
  created_at: Date
}

export default function PengaturanForm({ user }: { user: UserData }) {
  const [activeTab, setActiveTab] = useState<Tab>('profil')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [nama, setNama] = useState(user.name)
  const [email, setEmail] = useState({ baru: '', passwordKonfirmasi: '' })
  const [password, setPassword] = useState({ lama: '', baru: '', konfirmasi: '' })
  const [showPass, setShowPass] = useState({ lama: false, baru: false, konfirmasi: false })

  const showAlert = (type: 'success' | 'error', msg: string) => {
    setAlert({ type, msg })
    setTimeout(() => setAlert(null), 4000)
  }

  const handleSaveNama = async () => {
    setErrors({})
    if (!nama.trim()) {
      setErrors({ nama: 'Nama tidak boleh kosong' })
      toast.error('Nama tidak boleh kosong')
      return
    }
    setLoading(true)
    const toastId = toast.loading('Menyimpan nama...')
    try {
      const res = await fetch('/api/admin/pengaturan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'nama', nama }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      showAlert('success', 'Nama berhasil diperbarui')
      toast.success('Nama berhasil diperbarui', { id: toastId })
    } catch (e: any) {
      showAlert('error', e.message)
      toast.error(e.message || 'Gagal menyimpan nama', { id: toastId })
    }
    setLoading(false)
  }

  const handleSaveEmail = async () => {
    const e: Record<string, string> = {}
    if (!email.baru) e.emailBaru = 'Email baru wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.baru)) e.emailBaru = 'Format email tidak valid'
    if (!email.passwordKonfirmasi) e.passwordKonfirmasi = 'Password konfirmasi wajib diisi'
    setErrors(e)
    if (Object.keys(e).length > 0) {
      toast.error('Periksa field yang belum lengkap')
      return
    }

    setLoading(true)
    const toastId = toast.loading('Memperbarui email...')
    try {
      const res = await fetch('/api/admin/pengaturan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email', email: email.baru, password: email.passwordKonfirmasi }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      showAlert('success', 'Email berhasil diperbarui. Silakan login ulang.')
      toast.success('Email berhasil diperbarui. Silakan login ulang.', { id: toastId })
      setEmail({ baru: '', passwordKonfirmasi: '' })
      setErrors({})
    } catch (e: any) {
      showAlert('error', e.message)
      toast.error(e.message || 'Gagal memperbarui email', { id: toastId })
    }
    setLoading(false)
  }

  const handleSavePassword = async () => {
    const e: Record<string, string> = {}
    if (!password.lama) e.lama = 'Password lama wajib diisi'
    if (!password.baru) e.baru = 'Password baru wajib diisi'
    else if (password.baru.length < 8) e.baru = 'Minimal 8 karakter'
    if (!password.konfirmasi) e.konfirmasi = 'Konfirmasi wajib diisi'
    else if (password.konfirmasi !== password.baru) e.konfirmasi = 'Konfirmasi tidak cocok'
    setErrors(e)
    if (Object.keys(e).length > 0) {
      toast.error('Periksa field yang belum lengkap')
      return
    }

    setLoading(true)
    const toastId = toast.loading('Memperbarui password...')
    try {
      const res = await fetch('/api/admin/pengaturan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'password', passwordLama: password.lama, passwordBaru: password.baru }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      showAlert('success', 'Password berhasil diperbarui')
      toast.success('Password berhasil diperbarui', { id: toastId })
      setPassword({ lama: '', baru: '', konfirmasi: '' })
      setErrors({})
    } catch (e: any) {
      showAlert('error', e.message)
      toast.error(e.message || 'Gagal memperbarui password', { id: toastId })
    }
    setLoading(false)
  }

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profil', label: 'Ubah Nama', icon: User },
    { key: 'email', label: 'Ubah Email', icon: Mail },
    { key: 'password', label: 'Ubah Password', icon: Lock },
  ]

  return (
    <div className="surface-elevated overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-stone-200" role="tablist" aria-label="Bagian pengaturan">
        {tabs.map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setActiveTab(tab.key)
                setErrors({})
              }}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3.5 text-sm font-medium transition-colors',
                active
                  ? 'border-sage-600 text-sage-700 bg-sage-50/40'
                  : 'border-transparent text-stone-500 hover:bg-stone-50 hover:text-stone-700'
              )}
            >
              <tab.icon className="size-4" data-icon="inline-start" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-5 p-5 md:p-6">
        {/* Alert */}
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

        {/* Tab: Profil/Nama */}
        {activeTab === 'profil' && (
          <FormSection
            title="Ubah Nama Tampilan"
            description="Nama ini akan ditampilkan di panel admin dan sebagai author berita."
          >
            <FormField label="Nama Lengkap" required error={errors.nama} icon={<User className="size-4" />}>
              <Input
                type="text"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value)
                  if (errors.nama) setErrors((p) => ({ ...p, nama: '' }))
                }}
                placeholder="Nama lengkap Anda"
                disabled={loading}
              />
            </FormField>
            <FormActions>
              <Button onClick={handleSaveNama} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                ) : (
                  <Save className="size-4" data-icon="inline-start" />
                )}
                Simpan Nama
              </Button>
            </FormActions>
          </FormSection>
        )}

        {/* Tab: Email */}
        {activeTab === 'email' && (
          <FormSection
            title="Ubah Email"
            description="Setelah berhasil, Anda perlu login ulang dengan email baru."
          >
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm">
              <span className="text-stone-500">Email saat ini: </span>
              <span className="font-mono font-medium text-stone-800">{user.email}</span>
            </div>
            <FormField
              label="Email Baru"
              required
              error={errors.emailBaru}
              icon={<Mail className="size-4" />}
            >
              <Input
                type="email"
                value={email.baru}
                onChange={(e) => {
                  setEmail({ ...email, baru: e.target.value })
                  if (errors.emailBaru) setErrors((p) => ({ ...p, emailBaru: '' }))
                }}
                placeholder="email@baru.com"
                disabled={loading}
                autoComplete="email"
              />
            </FormField>
            <FormField
              label="Konfirmasi dengan Password"
              required
              error={errors.passwordKonfirmasi}
              hint="Masukkan password saat ini untuk verifikasi"
              icon={<Lock className="size-4" />}
            >
              <Input
                type="password"
                value={email.passwordKonfirmasi}
                onChange={(e) => {
                  setEmail({ ...email, passwordKonfirmasi: e.target.value })
                  if (errors.passwordKonfirmasi)
                    setErrors((p) => ({ ...p, passwordKonfirmasi: '' }))
                }}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
              />
            </FormField>
            <FormActions>
              <Button onClick={handleSaveEmail} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                ) : (
                  <Save className="size-4" data-icon="inline-start" />
                )}
                Simpan Email Baru
              </Button>
            </FormActions>
          </FormSection>
        )}

        {/* Tab: Password */}
        {activeTab === 'password' && (
          <FormSection
            title="Ubah Password"
            description="Password baru minimal 8 karakter."
          >
            {(
              [
                {
                  label: 'Password Lama',
                  key: 'lama' as const,
                  placeholder: 'Masukkan password saat ini',
                },
                {
                  label: 'Password Baru',
                  key: 'baru' as const,
                  placeholder: 'Minimal 8 karakter',
                  hint: 'Gunakan kombinasi huruf besar, kecil, angka, dan simbol',
                },
                {
                  label: 'Konfirmasi Password Baru',
                  key: 'konfirmasi' as const,
                  placeholder: 'Ulangi password baru',
                },
              ] as const
            ).map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                required
                error={errors[field.key]}
                hint={!errors[field.key] ? ('hint' in field ? field.hint : undefined) : undefined}
                icon={<Lock className="size-4" />}
              >
                <Input
                  type={showPass[field.key] ? 'text' : 'password'}
                  value={password[field.key]}
                  onChange={(e) => {
                    setPassword({ ...password, [field.key]: e.target.value })
                    if (errors[field.key])
                      setErrors((p) => ({ ...p, [field.key]: '' }))
                  }}
                  placeholder={field.placeholder}
                  className="pr-11"
                  disabled={loading}
                  autoComplete={
                    field.key === 'lama' ? 'current-password' : 'new-password'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPass({ ...showPass, [field.key]: !showPass[field.key] })}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-700"
                  aria-label={
                    showPass[field.key] ? 'Sembunyikan password' : 'Tampilkan password'
                  }
                >
                  {showPass[field.key] ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </FormField>
            ))}
            <FormActions>
              <Button onClick={handleSavePassword} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                ) : (
                  <Save className="size-4" data-icon="inline-start" />
                )}
                Simpan Password Baru
              </Button>
            </FormActions>
          </FormSection>
        )}
      </div>
    </div>
  )
}
