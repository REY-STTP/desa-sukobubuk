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
        <Loader2 className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-sage-500" />
      ) : (
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
      )}
      <input
        type="text"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-11 pr-4 text-sm transition-shadow placeholder:text-stone-400 focus:border-sage-300 focus:outline-none focus:ring-2 focus:ring-sage-500/20"
      />
    </div>
  )
}
