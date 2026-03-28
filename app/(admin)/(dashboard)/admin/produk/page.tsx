import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Package, Pencil, Store, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'
import Pagination from '@/components/admin/Pagination'
import SearchInput from '@/components/admin/SearchInput'
import { getProdukPage } from '@/lib/cache'

export const metadata: Metadata = { title: 'Kelola Produk' }

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function AdminProdukPage({ searchParams }: Props) {
  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const search = q?.trim() ?? ''

  const { data: produk, total, totalPages } = await getProdukPage(page, search)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-gray-500 text-sm mt-1">
            {search ? `${total} hasil untuk "${search}"` : `${total} produk terdaftar`}
          </p>
        </div>
        <Link href="/admin/produk/tambah" className="btn-primary">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Link>
      </div>

      {/* Search Bar */}
      <SearchInput
        placeholder="Cari nama produk atau nama UMKM..."
        defaultValue={search}
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {produk.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{search ? `Tidak ada produk yang cocok dengan "${search}"` : 'Belum ada data produk'}</p>
            {search && (
              <Link href="/admin/produk" className="mt-3 inline-block text-sm text-primary-600 hover:underline">
                Hapus pencarian
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* ── Mobile: Card View ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {produk.map((item) => (
                <div key={item.id} className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.nama_produk}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Store className="w-3 h-3" /> {item.umkm.nama_usaha}
                        </p>
                      </div>
                      {item.is_available
                        ? <span className="badge badge-green flex-shrink-0">Tersedia</span>
                        : <span className="badge bg-gray-100 text-gray-600 flex-shrink-0">Habis</span>
                      }
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(Number(item.harga))}</p>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(item.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Link href={`/admin/produk/${item.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <div className="flex-1">
                        <DeleteButton id={item.id} type="produk" nama={item.nama_produk} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop: Table View ── */}
            <div className="hidden md:block overflow-x-auto">
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

            <Pagination page={page} totalPages={totalPages} total={total} basePath="/admin/produk" searchQuery={search} />
          </>
        )}
      </div>
    </div>
  )
}