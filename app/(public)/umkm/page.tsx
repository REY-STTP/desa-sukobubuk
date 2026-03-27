import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import UMKMClientPage from './UMKMClientPage'

export const metadata: Metadata = {
  title: 'Direktori UMKM',
}

export default async function UMKMPage() {
  const umkm = await prisma.uMKM.findMany({
    orderBy: [{ is_featured: 'desc' }, { created_at: 'desc' }],
    include: { _count: { select: { produk: true } } },
  })

  const kategoriList = [...new Set(umkm.map((u) => u.kategori))]

  return <UMKMClientPage umkm={umkm} kategoriList={kategoriList} />
}
