'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Search, Loader2 } from 'lucide-react'

interface Props {
  placeholder?: string
  defaultValue?: string
}

export default function SearchInput({ placeholder = 'Cari...', defaultValue = '' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', '1')
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }, 300)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleSearch(e.target.value)
    },
    [handleSearch]
  )

  return (
    <div className="relative">
      {isPending ? (
        <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-500 animate-spin pointer-events-none" />
      ) : (
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      )}
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
      />
    </div>
  )
}