import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageSquare, Mail, MailOpen, MailCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Tag as UTag } from '@/components/ui/tag'
import { Button } from '@/components/ui/button'
import TandaiDibacaButton from './TandaiDibacaButton'
import DeleteButton from '@/components/admin/DeleteButton'
import Pagination from '@/components/admin/Pagination'
import SearchInput from '@/components/admin/SearchInput'
import { EmptyState } from '@/components/ui/empty-state'
import { getPesanPage } from '@/lib/cache'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Pesan Masuk' }

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function AdminPesanPage({ searchParams }: Props) {
  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const search = q?.trim() ?? ''

  const { data: pesan, total, belumDibaca, totalPages } = await getPesanPage(page, search)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-stone-800">Pesan Masuk</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-500">
            {search ? (
              <span>{total} hasil untuk "{search}"</span>
            ) : (
              <>
                <span>
                  {total} pesan total
                </span>
                {belumDibaca > 0 && (
                  <UTag tone="ember" size="sm">
                    <Mail className="size-3" />
                    {belumDibaca} belum dibaca
                  </UTag>
                )}
              </>
            )}
          </p>
        </div>
      </header>

      <SearchInput
        placeholder="Cari nama pengirim, email, atau isi pesan..."
        defaultValue={search}
      />

      {pesan.length === 0 ? (
        <div className="surface-elevated">
          <EmptyState
            icon={<MessageSquare className="size-6" />}
            title={search ? `Tidak ada pesan yang cocok dengan "${search}"` : 'Belum ada pesan masuk'}
            description={
              search
                ? 'Coba kata kunci lain.'
                : 'Pesan dari halaman kontak publik akan muncul di sini.'
            }
          />
        </div>
      ) : (
        <div className="surface-elevated overflow-hidden">
          <ul className="divide-y divide-stone-100">
            {pesan.map((item) => (
              <li
                key={item.id}
                className={cn(
                  'flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-stone-50 sm:flex-row sm:items-start',
                  !item.is_read && 'bg-sage-50/40'
                )}
              >
                <div
                  aria-hidden
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-xl',
                    item.is_read
                      ? 'bg-stone-100 text-stone-500'
                      : 'bg-sage-600 text-white'
                  )}
                >
                  {item.is_read ? (
                    <MailOpen className="size-4" />
                  ) : (
                    <Mail className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="truncate font-medium text-stone-800">
                        {item.nama}
                      </p>
                      {!item.is_read && (
                        <span
                          aria-hidden
                          className="size-2 shrink-0 rounded-full bg-sage-500"
                        />
                      )}
                    </div>
                    <p className="text-xs text-stone-400 shrink-0">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-stone-500 break-all font-mono">
                    {item.email}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    {item.isi_pesan}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                  {!item.is_read && (
                    <TandaiDibacaButton id={item.id} />
                  )}
                  <DeleteButton id={item.id} type="pesan" nama={`pesan dari ${item.nama}`} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={total} basePath="/admin/pesan" searchQuery={search} />
    </div>
  )
}
