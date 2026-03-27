import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import LupaPasswordForm from './LupaPasswordForm'

export const metadata: Metadata = { title: 'Lupa Password | Admin Desa Sukobubuk' }

export default function LupaPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-sage-800 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sage-600 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary-900/50 overflow-hidden">
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
          <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Link>
          <h2 className="font-display text-xl font-bold text-gray-900 mb-1">Lupa Password</h2>
          <p className="text-gray-500 text-sm mb-6">
            Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
          </p>
          <LupaPasswordForm />
        </div>
      </div>
    </div>
  )
}
