import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  basePath: string
  searchQuery?: string
}

export default function Pagination({ page, totalPages, total, basePath, searchQuery = '' }: PaginationProps) {
  if (totalPages <= 1) return null

  const prev = page - 1
  const next = page + 1

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', String(p))
    if (searchQuery) params.set('q', searchQuery)
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const delta = 2
  const start = Math.max(1, page - delta)
  const end = Math.min(totalPages, page + delta)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <div className="flex items-center justify-between border-t border-stone-200 px-5 py-3">
      <p className="text-xs text-stone-400">{total} data total</p>
      <div className="flex items-center gap-1">
        {page > 1 && (
          <Link href={buildHref(prev)} className="grid size-7 place-items-center rounded-lg transition-colors hover:bg-stone-100">
            <ChevronLeft className="size-4 text-stone-500" />
          </Link>
        )}
        {start > 1 && (
          <>
            <Link href={buildHref(1)} className="grid size-7 place-items-center rounded-lg text-xs transition-colors hover:bg-stone-100 text-stone-600">1</Link>
            {start > 2 && <span className="px-1 text-xs text-stone-400">…</span>}
          </>
        )}
        {pages.map((p) => (
          <Link
            key={p}
            href={buildHref(p)}
            className={`grid size-7 place-items-center rounded-lg text-xs transition-colors ${
              p === page ? 'bg-sage-600 font-semibold text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {p}
          </Link>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-xs text-stone-400">…</span>}
            <Link href={buildHref(totalPages)} className="grid size-7 place-items-center rounded-lg text-xs transition-colors hover:bg-stone-100 text-stone-600">{totalPages}</Link>
          </>
        )}
        {page < totalPages && (
          <Link href={buildHref(next)} className="grid size-7 place-items-center rounded-lg transition-colors hover:bg-stone-100">
            <ChevronRight className="size-4 text-stone-500" />
          </Link>
        )}
      </div>
    </div>
  )
}
