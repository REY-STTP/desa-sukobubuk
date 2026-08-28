import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import UMKMClientPage from './UMKMClientPage'
import { getUMKMPublik } from '@/lib/cache'

export const metadata: Metadata = {
  title: 'Direktori UMKM',
  description:
    'Direktori lengkap UMKM Desa Sukobubuk — Makanan, Kerajinan, Jasa, Pertanian. Temukan produk lokal dan hubungi pemilik langsung via WhatsApp.',
  alternates: { canonical: '/umkm' },
  openGraph: {
    title: 'UMKM Desa Sukobubuk',
    description: 'Daftar UMKM Desa Sukobubuk dengan filter kategori.',
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desa-sukobubuk.id'}/umkm`,
  },
  keywords: ['UMKM Desa Sukobubuk', 'produk lokal Pati', 'UMKM Margorejo', 'UMKM Jawa Tengah', 'produk lokal desa'],
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