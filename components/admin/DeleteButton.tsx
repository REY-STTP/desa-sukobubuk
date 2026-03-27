'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  id: number
  type: 'umkm' | 'produk' | 'berita' | 'galeri' | 'pesan'
  nama: string
}

export default function DeleteButton({ id, type, nama }: Props) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await fetch(`/api/admin/${type}/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch (e) {
      alert('Gagal menghapus data')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-600" />
      </button>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-slide-up">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-900 text-center mb-2">Hapus Data?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Anda akan menghapus <span className="font-semibold text-gray-900">"{nama}"</span>.
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
