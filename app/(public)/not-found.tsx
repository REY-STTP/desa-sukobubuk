import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
      <div className="text-center px-4">
        <div className="font-display text-9xl font-bold text-primary-200 select-none">404</div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mt-4">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
