import type { Metadata } from 'next'
import Image from 'next/image'
import { Users, MapPin } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PageWrapper from '@/components/animations/PageWrapper'

export const metadata: Metadata = { title: 'Struktur Organisasi' }

function OrgCard({
  jabatan,
  nama,
  foto_url,
  highlight = false,
}: {
  jabatan: string
  nama: string
  foto_url?: string | null
  highlight?: boolean
}) {
  return (
    <div className={`rounded-xl p-4 text-center border-2 transition-all ${highlight ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 hover:border-primary-300'}`}>
      <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center overflow-hidden ${highlight ? 'bg-white/20 ring-2 ring-white/40' : 'bg-primary-100 ring-2 ring-primary-100'}`}>
        {foto_url ? (
          <Image
            src={foto_url}
            alt={nama}
            width={64}
            height={64}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <Users className={`w-7 h-7 ${highlight ? 'text-white' : 'text-primary-600'}`} />
        )}
      </div>
      <p className={`font-semibold text-sm ${highlight ? 'text-white' : 'text-gray-900'}`}>{nama}</p>
      <p className={`text-xs mt-1 ${highlight ? 'text-white/80' : 'text-gray-500'}`}>{jabatan}</p>
    </div>
  )
}

export default async function StrukturOrganisasiPage() {
  const [profil, pejabat] = await Promise.all([
    prisma.profilDesa.findFirst(),
    prisma.pejabatDesa.findMany({ orderBy: [{ kategori: 'asc' }, { urutan: 'asc' }] }),
  ])
  if (!profil) notFound()

  const kepala = pejabat.find(p => p.kategori === 'kepala')
  const sek    = pejabat.find(p => p.kategori === 'sekretaris')
  const kasi   = pejabat.filter(p => p.kategori === 'kasi')
  const kaur   = pejabat.filter(p => p.kategori === 'kaur')
  const kadus  = pejabat.filter(p => p.kategori === 'kadus')

  return (
    <PageWrapper>
      <div className="pt-24">
        <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-16">
          <div className="container-custom">
            <div className="flex items-center gap-2 text-primary-300 text-sm mb-3">
              <MapPin className="w-4 h-4" />
              Profil Desa / Struktur Organisasi
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Struktur Organisasi</h1>
            <p className="text-primary-200 mt-2">Pemerintah {profil.nama_desa} Periode {profil.periode_visi_misi}</p>
          </div>
        </div>

        <div className="container-custom py-16">
          <div className="max-w-5xl mx-auto space-y-8">
            {kepala && (
              <div className="flex justify-center">
                <div className="w-64"><OrgCard {...kepala} highlight /></div>
              </div>
            )}
            {sek && (
              <>
                <div className="flex justify-center"><div className="w-0.5 h-8 bg-gray-300" /></div>
                <div className="flex justify-center">
                  <div className="w-64"><OrgCard {...sek} /></div>
                </div>
                <div className="flex justify-center"><div className="w-0.5 h-8 bg-gray-300" /></div>
              </>
            )}
            {kasi.length > 0 && (
              <div>
                <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Kepala Seksi</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {kasi.map(p => <OrgCard key={p.id} {...p} />)}
                </div>
              </div>
            )}
            {kaur.length > 0 && (
              <div>
                <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Kepala Urusan</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {kaur.map(p => <OrgCard key={p.id} {...p} />)}
                </div>
              </div>
            )}
            {kadus.length > 0 && (
              <div>
                <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Kepala Dusun</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {kadus.map(p => <OrgCard key={p.id} {...p} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}