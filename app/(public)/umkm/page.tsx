import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import UMKMClientPage from './UMKMClientPage'
import { getUMKMPublik } from '@/lib/cache'

export const metadata: Metadata = {
  title: 'Direktori UMKM',
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function UMKMPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)

  const { data: umkm, total, totalPages, kategoriList } = await getUMKMPublik(page)

  if (page > totalPages && totalPages > 0) notFound()

  return (
    <UMKMClientPage
      umkm={umkm}
      kategoriList={kategoriList}
      page={page}
      total={total}
      totalPages={totalPages}
    />
  )
}