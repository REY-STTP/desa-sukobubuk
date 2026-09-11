import type { Metadata } from 'next'
import { Star, StarHalf } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Tag as UTag } from '@/components/ui/tag'
import DeleteButton from '@/components/admin/DeleteButton'
import Pagination from '@/components/admin/Pagination'
import SearchInput from '@/components/admin/SearchInput'
import { EmptyState } from '@/components/ui/empty-state'
import { getUlasanPage } from '@/lib/cache'
import { cn } from '@/lib/utils'
import SetujuiButton from './SetujuiButton'

// TASK-REV-01 — moderasi ulasan. Meniru
// `app/(admin)/(dashboard)/admin/pesan/page.tsx` (gaya list karena
// komentar panjang): header + count pending, SearchInput, EmptyState,
// list kartu, Pagination. Aksi: Setujui/Tahan + Hapus.
export const metadata: Metadata = { title: 'Ulasan Produk' }

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function AdminUlasanPage({ searchParams }: Props) {
  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const search = q?.trim() ?? ''

  const { data: ulasan, total, pending, totalPages } = await getUlasanPage(page, search)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-stone-800">Ulasan Produk</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-500">
            {search ? (
              <span>{total} hasil untuk &quot;{search}&quot;</span>
            ) : (
              <>
                <span>{total} ulasan total</span>
                {pending > 0 && (
                  <UTag tone="ember" size="sm">
                    <StarHalf className="size-3" />
                    {pending} menunggu persetujuan
                  </UTag>
                )}
              </>
            )}
          </p>
        </div>
      </header>

      <SearchInput
        placeholder="Cari nama pengulas, isi ulasan, atau nama produk..."
        defaultValue={search}
      />

      {ulasan.length === 0 ? (
        <div className="surface-elevated">
          <EmptyState
            icon={<Star className="size-6" />}
            title={search ? `Tidak ada ulasan yang cocok dengan "${search}"` : 'Belum ada ulasan'}
            description={
              search
                ? 'Coba kata kunci lain.'
                : 'Ulasan dari halaman produk publik akan muncul di sini setelah dikirim.'
            }
          />
        </div>
      ) : (
        <div className="surface-elevated overflow-hidden">
          <ul className="divide-y divide-stone-100">
            {ulasan.map((item) => (
              <li
                key={item.id}
                className={cn(
                  'flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-stone-50 sm:flex-row sm:items-start',
                  !item.is_approved && 'bg-sage-50/40'
                )}
              >
                <div
                  aria-hidden
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-xl',
                    item.is_approved
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-sage-600 text-white'
                  )}
                >
                  <Star className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-stone-800">
                        {item.nama}
                      </p>
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-mono text-xs font-semibold text-stone-700 ring-1 ring-amber-200/70 tabular-nums"
                        aria-label={`Rating ${item.rating} dari 5`}
                      >
                        <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                        {item.rating}/5
                      </span>
                      <UTag tone={item.is_approved ? 'sage' : 'ember'} size="sm">
                        {item.is_approved ? 'Disetujui' : 'Pending'}
                      </UTag>
                    </div>
                    <p className="shrink-0 text-xs text-stone-400">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-stone-500">
                    Produk:{' '}
                    <span className="font-medium text-stone-700">
                      {item.produk.nama_produk}
                    </span>
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    {item.komentar}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <SetujuiButton id={item.id} approved={item.is_approved} />
                  <DeleteButton
                    id={item.id}
                    type="ulasan"
                    nama={`ulasan dari ${item.nama}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={total} basePath="/admin/ulasan" searchQuery={search} />
    </div>
  )
}
