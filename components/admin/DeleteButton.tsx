'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Props {
  id: number
  type: 'umkm' | 'produk' | 'berita' | 'galeri' | 'pesan'
  nama: string
}

export default function DeleteButton({ id, type, nama }: Props) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Gagal menghapus data')
      }
      window.dispatchEvent(new CustomEvent('admin:mutated'))
      router.refresh()
      setFeedback({ type: 'success', msg: `${nama} berhasil dihapus` })
      // Auto-dismiss setelah 4 detik
      setTimeout(() => setFeedback(null), 4000)
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message || 'Gagal menghapus data' })
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <div className="relative inline-flex">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowConfirm(true)}
          aria-label={`Hapus ${nama}`}
          className="text-stone-400 hover:bg-ember-50 hover:text-ember-600"
        >
          <Trash2 className="size-3.5" />
        </Button>

        {/* Inline feedback — muncul sebagai mini alert di pojok button */}
        {feedback && (
          <div
            role="status"
            className={
              'absolute right-0 top-full z-10 mt-2 w-64 rounded-xl border p-3 text-xs shadow-elevated-3 ' +
              (feedback.type === 'success'
                ? 'border-sage-200 bg-sage-50 text-sage-800'
                : 'border-ember-200 bg-ember-50 text-ember-800')
            }
          >
            {feedback.msg}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-sage-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-elevated-5">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-ember-100 text-ember-600">
              <AlertTriangle className="size-6" />
            </div>
            <h3 className="text-center font-display text-lg font-medium text-stone-800">Hapus Data?</h3>
            <p className="mt-2 text-center text-sm text-stone-500">
              Anda akan menghapus <span className="font-semibold text-stone-800">&ldquo;{nama}&rdquo;</span>. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)} className="flex-1">
                Batal
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading} className="flex-1">
                {loading ? (
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                ) : (
                  <Trash2 className="size-4" data-icon="inline-start" />
                )}
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
