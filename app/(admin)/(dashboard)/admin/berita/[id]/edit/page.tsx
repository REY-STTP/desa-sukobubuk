import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import BeritaForm from '@/components/admin/BeritaForm'

export const metadata: Metadata = { title: 'Edit Berita' }

export default async function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const berita = await prisma.berita.findUnique({ where: { id: parseInt(id) } })
  if (!berita) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/berita" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Berita
        </Link>
        <h1 className="font-display text-2xl font-bold text-gray-900">Edit Berita</h1>
        <p className="text-gray-500 text-sm mt-1 line-clamp-1">{berita.judul}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <BeritaForm mode="edit" initialData={{ ...berita, id: berita.id }} />
      </div>
    </div>
  )
}
