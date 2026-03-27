import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import ProfilForm from './ProfilForm'
import PejabatForm from './PejabatForm'

export const metadata: Metadata = { title: 'Profil Desa' }

export default async function AdminProfilPage() {
  const [profil, pejabat] = await Promise.all([
    prisma.profilDesa.findFirst(),
    prisma.pejabatDesa.findMany({ orderBy: [{ kategori: 'asc' }, { urutan: 'asc' }] }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Profil Desa</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola informasi, logo, sejarah, visi misi, dan struktur organisasi desa</p>
      </div>
      <ProfilForm initialData={profil} />
      <PejabatForm initialData={pejabat} />
    </div>
  )
}
