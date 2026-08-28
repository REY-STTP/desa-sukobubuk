import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Profil Desa' }

// Lazy load kedua form berat (9KB + 12KB) — tidak perlu blocking render awal
const ProfilForm = dynamic(() => import('./ProfilForm'), {
  loading: () => (
    <div className="surface-elevated p-5 md:p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-5 w-48 bg-stone-100 rounded" />
      <div className="h-10 bg-stone-50 rounded-xl" />
      <div className="h-10 bg-stone-50 rounded-xl" />
      <div className="h-32 bg-stone-50 rounded-xl" />
    </div>
  ),
})

const PejabatForm = dynamic(() => import('./PejabatForm'), {
  loading: () => (
    <div className="surface-elevated p-5 md:p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-5 w-48 bg-stone-100 rounded" />
      <div className="h-10 bg-stone-50 rounded-xl" />
      <div className="h-10 bg-stone-50 rounded-xl" />
    </div>
  ),
})

export default async function AdminProfilPage() {
  const [profil, pejabat] = await Promise.all([
    prisma.profilDesa.findFirst(),
    prisma.pejabatDesa.findMany({ orderBy: [{ kategori: 'asc' }, { urutan: 'asc' }] }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-stone-800">Profil Desa</h1>
        <p className="text-stone-500 text-sm mt-1">Kelola informasi, logo, sejarah, visi misi, dan struktur organisasi desa</p>
      </div>
      <ProfilForm initialData={profil} />
      <PejabatForm initialData={pejabat} />
    </div>
  )
}
