'use client'

import { useState } from 'react'
import { CheckCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Tandai sudah dibaca"
      className="w-8 h-8 rounded-lg bg-primary-50 hover:bg-primary-100 flex items-center justify-center transition-colors"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" /> : <CheckCheck className="w-3.5 h-3.5 text-primary-600" />}
    </button>
  )
}
