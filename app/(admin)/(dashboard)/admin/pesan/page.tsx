import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { MessageSquare, Mail, MailOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import TandaiDibacaButton from './TandaiDibacaButton'
import DeleteButton from '@/components/admin/DeleteButton'

export const metadata: Metadata = { title: 'Pesan Masuk' }

export default async function AdminPesanPage() {
  const pesan = await prisma.pesan.findMany({ orderBy: { created_at: 'desc' } })
  const belumDibaca = pesan.filter((p) => !p.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Pesan Masuk</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pesan.length} pesan total
            {belumDibaca > 0 && <span className="ml-2 badge bg-primary-100 text-primary-700">{belumDibaca} belum dibaca</span>}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {pesan.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada pesan masuk</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {pesan.map((item) => (
              <div key={item.id} className={`p-5 hover:bg-gray-50 transition-colors ${!item.is_read ? 'bg-primary-50/30' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.is_read ? 'bg-gray-100' : 'bg-primary-100'}`}>
                    {item.is_read
                      ? <MailOpen className="w-4 h-4 text-gray-500" />
                      : <Mail className="w-4 h-4 text-primary-600" />
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">{item.nama}</p>
                        {!item.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(item.created_at)}</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{item.email}</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{item.isi_pesan}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!item.is_read && <TandaiDibacaButton id={item.id} />}
                    <DeleteButton id={item.id} type="pesan" nama={`pesan dari ${item.nama}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
