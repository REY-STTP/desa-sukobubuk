import type { Metadata } from 'next'
import Image from 'next/image'
import ResetPasswordForm from './ResetPasswordForm'

export const metadata: Metadata = { title: 'Reset Password | Admin Desa Sukobubuk' }

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-sage-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sage-600 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="size-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-900/50 overflow-hidden">
            <Image
              src="/images/logo-desa.png"
              alt="Logo Desa"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Desa Sukobubuk</h1>
          <p className="text-primary-300 text-sm mt-1">Panel Admin</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-8">
          <h2 className="font-display text-xl font-bold text-stone-800 mb-1">Buat Password Baru</h2>
          <p className="text-stone-500 text-sm mb-6">Masukkan password baru untuk akun Anda.</p>
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  )
}
