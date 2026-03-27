import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Package, Pencil } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'

export const metadata: Metadata = { title: 'Kelola Produk' }

export default async function AdminProdukPage() {
  const produk = await prisma.produk.findMany({
    orderBy: { created_at: 'desc' },
    include: { umkm: { select: { nama_usaha: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-gray-500 text-sm mt-1">{produk.length} produk terdaftar</p>
        </div>
        <Link href="/admin/produk/tambah" className="btn-primary">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {produk.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada data produk</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Produk</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">UMKM</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {produk.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.nama_produk}</p>
                          <p className="text-xs text-gray-400">{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{item.umkm.nama_usaha}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{formatCurrency(Number(item.harga))}</td>
                    <td className="px-5 py-4">
                      {item.is_available
                        ? <span className="badge badge-green">Tersedia</span>
                        : <span className="badge bg-gray-100 text-gray-600">Habis</span>
                      }
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{formatDate(item.created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/produk/${item.id}/edit`}
                          className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        </Link>
                        <DeleteButton id={item.id} type="produk" nama={item.nama_produk} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
