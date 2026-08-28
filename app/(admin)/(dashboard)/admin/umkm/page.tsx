import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Store, Star, Pencil, Package, Tag, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'
import Pagination from '@/components/admin/Pagination'
import SearchInput from '@/components/admin/SearchInput'
import { getUMKMPage } from '@/lib/cache'
import { Button } from '@/components/ui/button'
import { Tag as UTag } from '@/components/ui/tag'
import { EmptyState } from '@/components/ui/empty-state'
import {
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTableHeaderCell,
  AdminTableCell,
} from '@/components/admin/Table'

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
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-stone-800">Kelola UMKM</h1>
          <p className="mt-1 text-sm text-stone-500">
            {search ? `${total} hasil untuk "${search}"` : `${total} UMKM terdaftar`}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/umkm/tambah">
            <Plus className="size-4" data-icon="inline-start" />
            Tambah UMKM
          </Link>
        </Button>
      </header>

      {/* Search bar */}
      <SearchInput
        placeholder="Cari nama usaha, pemilik, kategori, atau alamat..."
        defaultValue={search}
      />

      {umkm.length === 0 ? (
        <div className="surface-elevated">
          <EmptyState
            icon={<Store className="size-6" />}
            title={search ? `Tidak ada UMKM yang cocok dengan "${search}"` : 'Belum ada data UMKM'}
            description={search ? 'Coba kata kunci lain.' : 'Mulai dengan menambahkan UMKM pertama.'}
            action={
              !search ? (
                <Button asChild>
                  <Link href="/admin/umkm/tambah">
                    <Plus className="size-4" data-icon="inline-start" />
                    Tambah UMKM
                  </Link>
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Mobile: card view */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {umkm.map((item) => (
              <div key={item.id} className="surface-elevated p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-800 text-sm truncate">
                      {item.nama_usaha}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {item.pemilik}
                    </p>
                  </div>
                  {item.is_featured && (
                    <UTag tone="ember" size="sm">
                      <Star className="size-3" />
                      Unggulan
                    </UTag>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <UTag tone="sage" size="sm">
                    <Tag className="size-3" />
                    {item.kategori}
                  </UTag>
                  <span className="inline-flex items-center gap-1">
                    <Package className="size-3" />
                    {item._count.produk} produk
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDate(item.created_at)}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/umkm/${item.id}/edit`}>
                      <Pencil className="size-3.5" data-icon="inline-start" />
                      Edit
                    </Link>
                  </Button>
                  <div className="flex-1">
                    <DeleteButton id={item.id} type="umkm" nama={item.nama_usaha} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block">
            <AdminTable>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell>Nama Usaha</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Pemilik</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Kategori</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Produk</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Status</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Tanggal</AdminTableHeaderCell>
                  <AdminTableHeaderCell align="right">Aksi</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {umkm.map((item) => (
                  <AdminTableRow key={item.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-sage-100 text-sage-700">
                          <Store className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 truncate">
                            {item.nama_usaha}
                          </p>
                          <p className="text-xs text-stone-400 truncate font-mono">
                            /{item.slug}
                          </p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>{item.pemilik}</AdminTableCell>
                    <AdminTableCell>
                      <UTag tone="sage" size="sm">
                        <Tag className="size-3" />
                        {item.kategori}
                      </UTag>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="font-mono tabular-nums">{item._count.produk}</span>
                    </AdminTableCell>
                    <AdminTableCell>
                      {item.is_featured ? (
                        <UTag tone="ember" size="sm">
                          <Star className="size-3 fill-ember-400" />
                          Unggulan
                        </UTag>
                      ) : (
                        <span className="text-xs text-stone-400">-</span>
                      )}
                    </AdminTableCell>
                    <AdminTableCell className="text-xs text-stone-500">
                      {formatDate(item.created_at)}
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link href={`/admin/umkm/${item.id}/edit`} aria-label="Edit">
                            <Pencil className="size-3.5" />
                          </Link>
                        </Button>
                        <DeleteButton id={item.id} type="umkm" nama={item.nama_usaha} />
                      </div>
                    </AdminTableCell>
                  </AdminTableRow>
                ))}
              </AdminTableBody>
            </AdminTable>
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
  )
}
