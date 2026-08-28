'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function TandaiDibacaButton({ id }: { id: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    await fetch(`/api/admin/pesan/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_read: true }),
    })
    setLoading(false)
    window.dispatchEvent(new CustomEvent('admin:mutated'))
    router.refresh()
  }

  return (
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
  )
}
