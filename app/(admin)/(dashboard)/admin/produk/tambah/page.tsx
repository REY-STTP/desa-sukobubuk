import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ProdukForm from '@/components/admin/ProdukForm'

export const metadata: Metadata = { title: 'Tambah Produk' }

export default async function TambahProdukPage() {
  const umkmList = await prisma.uMKM.findMany({ select: { id: true, nama_usaha: true }, orderBy: { nama_usaha: 'asc' } })

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <Link href="/admin/produk" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-4 transition-colors">
          <ArrowLeft className="size-4" /> Kembali ke Daftar Produk
        </Link>
        <h1 className="font-display text-2xl font-medium text-stone-800">Tambah Produk</h1>
        <p className="text-stone-500 text-sm mt-1">Tambahkan produk baru ke direktori UMKM</p>
      </div>
      <div className="surface-elevated p-5 md:p-6">
        <ProdukForm mode="tambah" umkmList={umkmList} />
      </div>
    </div>
  )
}
