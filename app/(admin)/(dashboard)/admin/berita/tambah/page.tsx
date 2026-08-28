import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import BeritaForm from '@/components/admin/BeritaForm'

export const metadata: Metadata = { title: 'Tulis Berita' }

export default function TambahBeritaPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <Link href="/admin/berita" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-4 transition-colors">
          <ArrowLeft className="size-4" /> Kembali ke Daftar Berita
        </Link>
        <h1 className="font-display text-2xl font-medium text-stone-800">Tulis Berita</h1>
        <p className="text-stone-500 text-sm mt-1">Buat artikel berita atau pengumuman baru</p>
      </div>
      <div className="surface-elevated p-5 md:p-6">
        <BeritaForm mode="tambah" />
      </div>
    </div>
  )
}
