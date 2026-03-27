import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { Images } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import DeleteButton from '@/components/admin/DeleteButton'
import GaleriUploadForm from './GaleriUploadForm'

export const metadata: Metadata = { title: 'Kelola Galeri' }

export default async function AdminGaleriPage() {
  const galeri = await prisma.galeri.findMany({ orderBy: { created_at: 'desc' } })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Kelola Galeri</h1>
          <p className="text-gray-500 text-sm mt-1">{galeri.length} foto terpublish</p>
        </div>
      </div>

      {/* Upload Form */}
      <GaleriUploadForm />

      {/* Grid Foto */}
      {galeri.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 text-center py-16 text-gray-400">
          <Images className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada foto di galeri</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galeri.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
              <div className="aspect-square bg-gray-100 relative">
                {item.foto ? (
                  <img src={item.foto} alt={item.judul} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Images className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.judul}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.created_at)}</p>
                <div className="mt-2">
                  <DeleteButton id={item.id} type="galeri" nama={item.judul} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
