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
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <Link href="/admin/umkm" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-4 transition-colors">
          <ArrowLeft className="size-4" /> Kembali ke Daftar UMKM
        </Link>
        <h1 className="font-display text-2xl font-medium text-stone-800">Edit UMKM</h1>
        <p className="text-stone-500 text-sm mt-1">Perbarui informasi {umkm.nama_usaha}</p>
      </div>
      <div className="surface-elevated p-5 md:p-6">
        <UMKMForm mode="edit" initialData={{ ...umkm, id: umkm.id }} />
      </div>
    </div>
  )
}
