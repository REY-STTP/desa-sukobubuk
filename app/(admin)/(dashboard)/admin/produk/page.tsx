import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Package, Pencil, Store, Calendar, CircleCheck, CircleX } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'
import Pagination from '@/components/admin/Pagination'
import SearchInput from '@/components/admin/SearchInput'
import { getProdukPage } from '@/lib/cache'
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-stone-800">Kelola Produk</h1>
          <p className="mt-1 text-sm text-stone-500">
            {search ? `${total} hasil untuk "${search}"` : `${total} produk terdaftar`}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/produk/tambah">
            <Plus className="size-4" data-icon="inline-start" />
            Tambah Produk
          </Link>
        </Button>
      </header>

      <SearchInput placeholder="Cari nama produk atau nama UMKM..." defaultValue={search} />

      {produk.length === 0 ? (
        <div className="surface-elevated">
          <EmptyState
            icon={<Package className="size-6" />}
            title={search ? `Tidak ada produk yang cocok dengan "${search}"` : 'Belum ada data produk'}
            description={search ? 'Coba kata kunci lain.' : 'Mulai dengan menambahkan produk pertama.'}
            action={
              !search ? (
                <Button asChild>
                  <Link href="/admin/produk/tambah">
                    <Plus className="size-4" data-icon="inline-start" />
                    Tambah Produk
                  </Link>
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {produk.map((item) => (
              <div key={item.id} className="surface-elevated p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-800 text-sm line-clamp-2">
                      {item.nama_produk}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-500 line-clamp-1">
                      {item.umkm.nama_usaha}
                    </p>
                  </div>
                  {item.is_available ? (
                    <UTag tone="sage" size="sm">
                      <CircleCheck className="size-3" />
                      Aktif
                    </UTag>
                  ) : (
                    <UTag tone="stone" size="sm">
                      <CircleX className="size-3" />
                      Off
                    </UTag>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-mono font-semibold text-sage-700 tabular-nums">
                    {formatCurrency(item.harga.toString())}
                  </span>
                  <UTag tone="muted" size="sm">
                    <Store className="size-3" />
                    {item.umkm.kategori}
                  </UTag>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/produk/${item.id}/edit`}>
                      <Pencil className="size-3.5" data-icon="inline-start" />
                      Edit
                    </Link>
                  </Button>
                  <div className="flex-1">
                    <DeleteButton id={item.id} type="produk" nama={item.nama_produk} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <AdminTable>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell>Nama Produk</AdminTableHeaderCell>
                  <AdminTableHeaderCell>UMKM</AdminTableHeaderCell>
                  <AdminTableHeaderCell align="right">Harga</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Status</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Tanggal</AdminTableHeaderCell>
                  <AdminTableHeaderCell align="right">Aksi</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {produk.map((item) => (
                  <AdminTableRow key={item.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-ember-100 text-ember-700">
                          <Package className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 line-clamp-1">
                            {item.nama_produk}
                          </p>
                          <p className="text-xs text-stone-400 truncate font-mono">
                            /{item.slug}
                          </p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div>
                        <p className="text-sm text-stone-700">{item.umkm.nama_usaha}</p>
                        <p className="text-xs text-stone-400">{item.umkm.kategori}</p>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <span className="font-mono font-semibold tabular-nums text-stone-800">
                        {formatCurrency(item.harga.toString())}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      {item.is_available ? (
                        <UTag tone="sage" size="sm">
                          <CircleCheck className="size-3" />
                          Tersedia
                        </UTag>
                      ) : (
                        <UTag tone="stone" size="sm">
                          <CircleX className="size-3" />
                          Tidak tersedia
                        </UTag>
                      )}
                    </AdminTableCell>
                    <AdminTableCell className="text-xs text-stone-500">
                      {formatDate(item.created_at)}
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link href={`/admin/produk/${item.id}/edit`} aria-label="Edit">
                            <Pencil className="size-3.5" />
                          </Link>
                        </Button>
                        <DeleteButton id={item.id} type="produk" nama={item.nama_produk} />
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
            basePath={`/admin/produk${search ? `?q=${encodeURIComponent(search)}&` : '?'}`.replace(/\?$/, '')}
            searchQuery={search}
          />
        </>
      )}
    </div>
  )
}
