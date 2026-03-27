'use client'

import { useState } from 'react'
import { User, Mail, Lock, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

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

  // Form states
  const [nama, setNama] = useState(user.name)
  const [email, setEmail] = useState({ baru: '', passwordKonfirmasi: '' })
  const [password, setPassword] = useState({ lama: '', baru: '', konfirmasi: '' })
  const [showPass, setShowPass] = useState({ lama: false, baru: false, konfirmasi: false })

  const showAlert = (type: 'success' | 'error', msg: string) => {
    setAlert({ type, msg })
    setTimeout(() => setAlert(null), 4000)
  }

  const handleSaveNama = async () => {
    if (!nama.trim()) { showAlert('error', 'Nama tidak boleh kosong'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pengaturan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'nama', nama }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      showAlert('success', 'Nama berhasil diperbarui')
    } catch (e: any) { showAlert('error', e.message) }
    setLoading(false)
  }

  const handleSaveEmail = async () => {
    if (!email.baru || !email.passwordKonfirmasi) { showAlert('error', 'Semua field wajib diisi'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pengaturan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email', email: email.baru, password: email.passwordKonfirmasi }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      showAlert('success', 'Email berhasil diperbarui. Silakan login ulang.')
      setEmail({ baru: '', passwordKonfirmasi: '' })
    } catch (e: any) { showAlert('error', e.message) }
    setLoading(false)
  }

  const handleSavePassword = async () => {
    if (!password.lama || !password.baru || !password.konfirmasi) { showAlert('error', 'Semua field wajib diisi'); return }
    if (password.baru.length < 8) { showAlert('error', 'Password baru minimal 8 karakter'); return }
    if (password.baru !== password.konfirmasi) { showAlert('error', 'Konfirmasi password tidak cocok'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/pengaturan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'password', passwordLama: password.lama, passwordBaru: password.baru }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      showAlert('success', 'Password berhasil diperbarui')
      setPassword({ lama: '', baru: '', konfirmasi: '' })
    } catch (e: any) { showAlert('error', e.message) }
    setLoading(false)
  }

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profil', label: 'Ubah Nama', icon: User },
    { key: 'email', label: 'Ubah Email', icon: Mail },
    { key: 'password', label: 'Ubah Password', icon: Lock },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors flex-1 justify-center',
              activeTab === tab.key
                ? 'text-primary-700 border-b-2 border-primary-600 bg-primary-50/50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-5">
        {/* Alert */}
        {alert && (
          <div className={cn(
            'flex items-center gap-2.5 rounded-xl p-3.5 text-sm',
            alert.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
          )}>
            {alert.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {alert.msg}
          </div>
        )}

        {/* Tab: Profil/Nama */}
        {activeTab === 'profil' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nama Tampilan</label>
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="input-field" placeholder="Nama lengkap Anda" />
            </div>
            <button onClick={handleSaveNama} disabled={loading} className="btn-primary disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Simpan Nama
            </button>
          </div>
        )}

        {/* Tab: Email */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
              Email saat ini: <span className="font-semibold text-gray-900">{user.email}</span>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Baru</label>
              <input type="email" value={email.baru} onChange={(e) => setEmail({ ...email, baru: e.target.value })} className="input-field" placeholder="email@baru.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Konfirmasi dengan Password</label>
              <input type="password" value={email.passwordKonfirmasi} onChange={(e) => setEmail({ ...email, passwordKonfirmasi: e.target.value })} className="input-field" placeholder="••••••••" />
            </div>
            <button onClick={handleSaveEmail} disabled={loading} className="btn-primary disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Simpan Email Baru
            </button>
          </div>
        )}

        {/* Tab: Password */}
        {activeTab === 'password' && (
          <div className="space-y-4">
            {[
              { label: 'Password Lama', key: 'lama' as const, placeholder: 'Masukkan password saat ini' },
              { label: 'Password Baru', key: 'baru' as const, placeholder: 'Minimal 8 karakter' },
              { label: 'Konfirmasi Password Baru', key: 'konfirmasi' as const, placeholder: 'Ulangi password baru' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass[field.key] ? 'text' : 'password'}
                    value={password[field.key]}
                    onChange={(e) => setPassword({ ...password, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="input-field pl-10 pr-11"
                  />
                  <button type="button" onClick={() => setShowPass({ ...showPass, [field.key]: !showPass[field.key] })}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleSavePassword} disabled={loading} className="btn-primary disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Simpan Password Baru
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
