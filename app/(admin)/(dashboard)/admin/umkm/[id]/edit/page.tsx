import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import UMKMForm from '@/components/admin/UMKMForm'

export const metadata: Metadata = { title: 'Edit UMKM' }

export default async function EditUMKMPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const umkm = await prisma.uMKM.findUnique({ where: { id: parseInt(id) } })
  if (!umkm) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/umkm" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar UMKM
        </Link>
        <h1 className="font-display text-2xl font-bold text-gray-900">Edit UMKM</h1>
        <p className="text-gray-500 text-sm mt-1">Perbarui informasi {umkm.nama_usaha}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <UMKMForm mode="edit" initialData={{ ...umkm, id: umkm.id }} />
      </div>
    </div>
  )
}
