import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Newspaper, Pencil, User, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'
import Pagination from '@/components/admin/Pagination'
import SearchInput from '@/components/admin/SearchInput'
import { getBeritaPage } from '@/lib/cache'

export const metadata: Metadata = { title: 'Kelola Berita' }

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function AdminBeritaPage({ searchParams }: Props) {
  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const search = q?.trim() ?? ''

  const { data: berita, total, totalPages } = await getBeritaPage(page, search)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Kelola Berita</h1>
          <p className="text-gray-500 text-sm mt-1">
            {search ? `${total} hasil untuk "${search}"` : `${total} artikel terpublish`}
          </p>
        </div>
        <Link href="/admin/berita/tambah" className="btn-primary">
          <Plus className="w-4 h-4" /> Tulis Berita
        </Link>
      </div>

      {/* Search Bar */}
      <SearchInput
        placeholder="Cari judul berita atau nama penulis..."
        defaultValue={search}
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {berita.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{search ? `Tidak ada berita yang cocok dengan "${search}"` : 'Belum ada berita'}</p>
            {search && (
              <Link href="/admin/berita" className="mt-3 inline-block text-sm text-primary-600 hover:underline">
                Hapus pencarian
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* ── Mobile: Card View ── */}
            <div className="md:hidden divide-y divide-gray-100">
              {berita.map((item) => (
                <div key={item.id} className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Newspaper className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm line-clamp-2">{item.judul}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <User className="w-3 h-3" /> {item.author.name}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(item.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Link href={`/admin/berita/${item.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <div className="flex-1">
                        <DeleteButton id={item.id} type="berita" nama={item.judul} />
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
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Penulis</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {berita.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Newspaper className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm line-clamp-1">{item.judul}</p>
                            <p className="text-xs text-gray-400">{item.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{item.author.name}</td>
                      <td className="px-5 py-4 text-xs text-gray-400">{formatDate(item.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/berita/${item.id}/edit`}
                            className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-colors">
                            <Pencil className="w-3.5 h-3.5 text-blue-600" />
                          </Link>
                          <DeleteButton id={item.id} type="berita" nama={item.judul} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination page={page} totalPages={totalPages} total={total} basePath="/admin/berita" searchQuery={search} />
          </>
        )}
      </div>
    </div>
  )
}