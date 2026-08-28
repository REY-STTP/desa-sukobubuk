import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Images, Calendar, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'
import Pagination from '@/components/admin/Pagination'
import SearchInput from '@/components/admin/SearchInput'
import { getGaleriPage } from '@/lib/cache'
import { EmptyState } from '@/components/ui/empty-state'
import { Tag as UTag } from '@/components/ui/tag'

export const metadata: Metadata = { title: 'Kelola Galeri' }

const GaleriUploadForm = dynamic(() => import('./GaleriUploadForm'), {
  loading: () => (
    <div className="surface-elevated p-6 animate-pulse">
      <div className="h-5 w-40 bg-stone-100 rounded mb-4" />
      <div className="h-40 bg-stone-50 rounded-xl" />
    </div>
  ),
})

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function AdminGaleriPage({ searchParams }: Props) {
  const { page: pageParam, q } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const search = q?.trim() ?? ''

  const { data: galeri, total, totalPages } = await getGaleriPage(page, search)

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-medium text-stone-800">Kelola Galeri</h1>
        <p className="mt-1 text-sm text-stone-500">
          {search ? `${total} hasil untuk "${search}"` : `${total} foto terpublish`}
        </p>
      </header>

      <GaleriUploadForm />

      <SearchInput placeholder="Cari judul foto..." defaultValue={search} />

      {galeri.length === 0 ? (
        <div className="surface-elevated">
          <EmptyState
            icon={<Images className="size-6" />}
            title={search ? `Tidak ada foto yang cocok dengan "${search}"` : 'Belum ada foto di galeri'}
            description={search ? 'Coba kata kunci lain.' : 'Upload foto pertama untuk galeri desa.'}
          />
        </div>
      ) : (
        <>
          <div className="surface-elevated p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {galeri.map((item) => (
                <div key={item.id} className="group overflow-hidden rounded-xl border border-stone-200 bg-white">
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    {item.foto ? (
                      <img
                        src={item.foto}
                        alt={item.judul}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid size-full place-items-center">
                        <Images className="size-8 text-stone-300" />
                      </div>
                    )}
                    {item.foto && (
                      <a
                        href={item.foto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg bg-black/40 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
                        aria-label="Lihat full size"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-stone-800">
                      {item.judul}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                      <Calendar className="size-3" />
                      {formatDate(item.created_at)}
                    </div>
                    <div className="mt-2.5">
                      <DeleteButton
                        id={item.id}
                        type="galeri"
                        nama={item.judul}
                        variant="block"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Pagination page={page} totalPages={totalPages} total={total} basePath="/admin/galeri" searchQuery={search} />
        </>
      )}
    </div>
  )
}
