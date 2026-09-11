'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// TASK-REV-01 — tombol setujui/tahan ulasan. Meniru
// `app/(admin)/(dashboard)/admin/pesan/TandaiDibacaButton.tsx`:
// PATCH `/api/admin/ulasan/[id]` + `admin:mutated` + `router.refresh()`.
export default function SetujuiButton({ id, approved }: { id: number; approved: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/ulasan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: !approved }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Gagal mengubah status ulasan')
      }
      setFeedback({
        type: 'success',
        msg: approved ? 'Ulasan ditahan (tidak tampil publik)' : 'Ulasan disetujui (tampil publik)',
      })
      setTimeout(() => setFeedback(null), 4000)
      window.dispatchEvent(new CustomEvent('admin:mutated'))
      router.refresh()
    } catch (e: unknown) {
      setFeedback({ type: 'error', msg: e instanceof Error ? e.message : 'Gagal mengubah status ulasan' })
    }
    setLoading(false)
  }

  return (
    <div className="relative inline-flex">
      <Button
        onClick={handleClick}
        disabled={loading}
        variant="outline"
        size="sm"
        aria-label={approved ? 'Tahan ulasan' : 'Setujui ulasan'}
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" data-icon="inline-start" />
        ) : (
          <Check className="size-3.5" data-icon="inline-start" />
        )}
        {approved ? 'Tahan' : 'Setujui'}
      </Button>

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
  )
}
