import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Newspaper, Pencil, User, Calendar, Eye } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'
import Pagination from '@/components/admin/Pagination'
import SearchInput from '@/components/admin/SearchInput'
import { getBeritaPage } from '@/lib/cache'
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
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-stone-800">Kelola Berita</h1>
          <p className="mt-1 text-sm text-stone-500">
            {search ? `${total} hasil untuk "${search}"` : `${total} artikel terpublish`}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/berita/tambah">
            <Plus className="size-4" data-icon="inline-start" />
            Tulis Berita
          </Link>
        </Button>
      </header>

      <SearchInput placeholder="Cari judul berita atau nama penulis..." defaultValue={search} />

      {berita.length === 0 ? (
        <div className="surface-elevated">
          <EmptyState
            icon={<Newspaper className="size-6" />}
            title={search ? `Tidak ada berita yang cocok dengan "${search}"` : 'Belum ada berita'}
            description={search ? 'Coba kata kunci lain.' : 'Mulai menulis berita pertama untuk desa.'}
            action={
              !search ? (
                <Button asChild>
                  <Link href="/admin/berita/tambah">
                    <Plus className="size-4" data-icon="inline-start" />
                    Tulis Berita
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
            {berita.map((item) => (
              <div key={item.id} className="surface-elevated p-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                    <Newspaper className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-800 text-sm line-clamp-2">
                      {item.judul}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3" />
                        {item.author.name}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-stretch gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/admin/berita/${item.id}/edit`}>
                      <Pencil className="size-3.5" data-icon="inline-start" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteButton
                    id={item.id}
                    type="berita"
                    nama={item.judul}
                    variant="block"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <AdminTable>
              <AdminTableHead>
                <tr>
                  <AdminTableHeaderCell>Judul</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Penulis</AdminTableHeaderCell>
                  <AdminTableHeaderCell>Tanggal</AdminTableHeaderCell>
                  <AdminTableHeaderCell align="right">Aksi</AdminTableHeaderCell>
                </tr>
              </AdminTableHead>
              <AdminTableBody>
                {berita.map((item) => (
                  <AdminTableRow key={item.id}>
                    <AdminTableCell>
                      <div className="flex items-center gap-2.5 min-w-0 max-w-md">
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                          <Newspaper className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 line-clamp-1">
                            {item.judul}
                          </p>
                          <p className="text-xs text-stone-400 truncate font-mono">
                            /berita/{item.slug}
                          </p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <User className="size-3.5 text-stone-400" />
                        {item.author.name}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell className="text-xs text-stone-500">
                      {formatDate(item.created_at)}
                    </AdminTableCell>
                    <AdminTableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link href={`/berita/${item.slug}`} target="_blank" aria-label="Lihat">
                            <Eye className="size-3.5" />
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link href={`/admin/berita/${item.id}/edit`} aria-label="Edit">
                            <Pencil className="size-3.5" />
                          </Link>
                        </Button>
                        <DeleteButton id={item.id} type="berita" nama={item.judul} />
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
            basePath={`/admin/berita${search ? `?q=${encodeURIComponent(search)}&` : '?'}`.replace(/\?$/, '')}
            searchQuery={search}
          />
        </>
      )}
    </div>
  )
}
