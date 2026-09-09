'use client'

import { useLoading } from '@/lib/loading-context'

export default function ClientMain({ children }: { children: React.ReactNode }) {
  const { isLoading } = useLoading()
  return (
    <main id="main-content" tabIndex={-1} aria-busy={isLoading}>
      {children}
    </main>
  )
}
