import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ProdukForm from '@/components/admin/ProdukForm'

export const metadata: Metadata = { title: 'Edit Produk' }

export default async function EditProdukPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [produk, umkmList] = await Promise.all([
    prisma.produk.findUnique({ where: { id: parseInt(id) } }),
    prisma.uMKM.findMany({ select: { id: true, nama_usaha: true }, orderBy: { nama_usaha: 'asc' } }),
  ])
  if (!produk) notFound()

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/admin/produk" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Produk
        </Link>
        <h1 className="font-display text-2xl font-bold text-gray-900">Edit Produk</h1>
        <p className="text-gray-500 text-sm mt-1">Perbarui informasi {produk.nama_produk}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <ProdukForm
          mode="edit"
          umkmList={umkmList}
          initialData={{ ...produk, id: produk.id, harga: produk.harga.toString(), umkm_id: produk.umkm_id.toString() }}
        />
      </div>
    </div>
  )
}
