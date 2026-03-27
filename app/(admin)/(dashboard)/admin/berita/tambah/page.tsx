import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BeritaForm from '@/components/admin/BeritaForm'

export const metadata: Metadata = { title: 'Tulis Berita' }

export default function TambahBeritaPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/berita" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Berita
        </Link>
        <h1 className="font-display text-2xl font-bold text-gray-900">Tulis Berita</h1>
        <p className="text-gray-500 text-sm mt-1">Buat artikel berita atau pengumuman baru</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <BeritaForm mode="tambah" />
      </div>
    </div>
  )
}
