import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  basePath: string
}

export default function Pagination({ page, totalPages, total, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const prev = page - 1
  const next = page + 1

  // Build page window: show max 5 page numbers
  const delta = 2
  const start = Math.max(1, page - delta)
  const end = Math.min(totalPages, page + delta)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <p className="text-xs text-gray-400">{total} data total</p>
      <div className="flex items-center gap-1">
        {page > 1 && (
          <Link
            href={`${basePath}?page=${prev}`}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </Link>
        )}
        {start > 1 && (
          <>
            <Link href={`${basePath}?page=1`} className="w-7 h-7 rounded-lg text-xs flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">1</Link>
            {start > 2 && <span className="text-gray-400 text-xs px-1">…</span>}
          </>
        )}
        {pages.map((p) => (
          <Link
            key={p}
            href={`${basePath}?page=${p}`}
            className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-colors ${
              p === page
                ? 'bg-primary-600 text-white font-semibold'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            {p}
          </Link>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-gray-400 text-xs px-1">…</span>}
            <Link href={`${basePath}?page=${totalPages}`} className="w-7 h-7 rounded-lg text-xs flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors">{totalPages}</Link>
          </>
        )}
        {page < totalPages && (
          <Link
            href={`${basePath}?page=${next}`}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </Link>
        )}
      </div>
    </div>
  )
}
