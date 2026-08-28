'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function TandaiDibacaButton({ id }: { id: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleClick = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/pesan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Gagal menandai pesan')
      }
      setFeedback({ type: 'success', msg: 'Pesan ditandai sudah dibaca' })
      setTimeout(() => setFeedback(null), 4000)
      window.dispatchEvent(new CustomEvent('admin:mutated'))
      router.refresh()
    } catch (e: any) {
      setFeedback({ type: 'error', msg: e.message || 'Gagal menandai pesan' })
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
        aria-label="Tandai sudah dibaca"
      >
        {loading ? (
          <Loader2 className="size-3.5 animate-spin" data-icon="inline-start" />
        ) : (
          <Check className="size-3.5" data-icon="inline-start" />
        )}
        Tandai Dibaca
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
