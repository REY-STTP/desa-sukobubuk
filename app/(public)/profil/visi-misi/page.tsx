import type { Metadata } from 'next'
import { Eye, Target, CheckCircle, MapPin } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PageWrapper from '@/components/animations/PageWrapper'

export const metadata: Metadata = { title: 'Visi & Misi' }

export default async function VisiMisiPage() {
  const profil = await prisma.profilDesa.findFirst()
  if (!profil) notFound()

  let misi: string[] = []
  try { misi = JSON.parse(profil.misi) } catch { misi = [] }

  return (
    <PageWrapper>
      <div className="pt-24">
        <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-16">
          <div className="container-custom">
            <div className="flex items-center gap-2 text-primary-300 text-sm mb-3">
              <MapPin className="w-4 h-4" />
              Profil Desa / Visi & Misi
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">Visi & Misi</h1>
            <p className="text-primary-200 mt-2">{profil.nama_desa} Periode {profil.periode_visi_misi}</p>
          </div>
        </div>

        <div className="container-custom py-16 max-w-4xl mx-auto">
          {/* Visi */}
          <div className="card p-8 mb-8 border-2 border-primary-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900">Visi</h2>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-sage-50 rounded-2xl p-6 border border-primary-100">
              <p className="font-display text-xl md:text-2xl text-primary-900 font-semibold italic leading-relaxed text-center">
                "{profil.visi}"
              </p>
            </div>
          </div>

          {/* Misi */}
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900">Misi</h2>
            </div>
            <ul className="space-y-4">
              {misi.map((item, index) => (
                <li key={index} className="flex gap-4 p-4 rounded-xl hover:bg-primary-50 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{item}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
