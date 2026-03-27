import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import UMKMForm from '@/components/admin/UMKMForm'

export const metadata: Metadata = { title: 'Tambah UMKM' }

export default function TambahUMKMPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/umkm" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar UMKM
        </Link>
        <h1 className="font-display text-2xl font-bold text-gray-900">Tambah UMKM</h1>
        <p className="text-gray-500 text-sm mt-1">Daftarkan UMKM baru ke direktori desa</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <UMKMForm mode="tambah" />
      </div>
    </div>
  )
}
