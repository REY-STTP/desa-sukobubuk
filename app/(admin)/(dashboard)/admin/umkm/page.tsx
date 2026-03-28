import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Store, Star, Pencil, Package, Tag, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'
import Pagination from '@/components/admin/Pagination'
import SearchInput from '@/components/admin/SearchInput'
import { getUMKMPage } from '@/lib/cache'

export const metadata: Metadata = { title: 'Kelola UMKM' }

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function AdminUMKMPage({ searchParams }: Props) {
  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const search = q?.trim() ?? ''

  const { data: umkm, total, totalPages } = await getUMKMPage(page, search)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Kelola UMKM</h1>
          <p className="text-gray-500 text-sm mt-1">
            {search ? `${total} hasil untuk "${search}"` : `${total} UMKM terdaftar`}
          </p>
        </div>
        <Link href="/admin/umkm/tambah" className="btn-primary">
          <Plus className="w-4 h-4" /> Tambah UMKM
        </Link>
      </div>

      {/* Search Bar */}
      <SearchInput
        placeholder="Cari nama usaha, pemilik, kategori, atau alamat..."
        defaultValue={search}
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {umkm.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{search ? `Tidak ada UMKM yang cocok dengan "${search}"` : 'Belum ada data UMKM'}</p>
            {search && (
              <Link href="/admin/umkm" className="mt-3 inline-block text-sm text-primary-600 hover:underline">
                Hapus pencarian
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* ── Mobile: Card View ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {umkm.map((item) => (
                <div key={item.id} className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Store className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{item.nama_usaha}</p>
                        <p className="text-xs text-gray-400">{item.pemilik}</p>
                      </div>
                      {item.is_featured && (
                        <span className="flex items-center gap-1 text-xs text-yellow-600 font-semibold flex-shrink-0">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Unggulan
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="badge badge-green flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {item.kategori}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Package className="w-3 h-3" /> {item._count.produk} produk
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(item.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Link href={`/admin/umkm/${item.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <div className="flex-1">
                        <DeleteButton id={item.id} type="umkm" nama={item.nama_usaha} />
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
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Usaha</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pemilik</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Produk</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Unggulan</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {umkm.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                            <Store className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.nama_usaha}</p>
                            <p className="text-xs text-gray-400">{item.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{item.pemilik}</td>
                      <td className="px-5 py-4">
                        <span className="badge badge-green">{item.kategori}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{item._count.produk} produk</td>
                      <td className="px-5 py-4">
                        {item.is_featured ? (
                          <span className="flex items-center gap-1 text-xs text-yellow-600 font-semibold">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> Unggulan
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">{formatDate(item.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/umkm/${item.id}/edit`}
                            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Pencil className="w-3.5 h-3.5 text-blue-600" />
                          </Link>
                          <DeleteButton id={item.id} type="umkm" nama={item.nama_usaha} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              basePath={`/admin/umkm${search ? `?q=${encodeURIComponent(search)}&` : '?'}`.replace(/\?$/, '')}
              searchQuery={search}
            />
          </>
        )}
      </div>
    </div>
  )
}