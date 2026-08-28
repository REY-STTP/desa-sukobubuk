import type { Metadata } from 'next'
import { getDashboardStats } from '@/lib/cache'
import DashboardLive from '@/components/admin/DashboardLive'

export const metadata: Metadata = { title: 'Dashboard' }

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function getTodayFormatted(): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()
  // serialize dates for client component
  const initialStats = {
    ...stats,
    pesanTerbaru: stats.pesanTerbaru.map((p) => ({
      ...p,
      created_at: new Date(p.created_at as unknown as string).toISOString(),
    })),
  }

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <header>
        <p className="section-eyebrow text-sage-700 mb-1">{getTodayFormatted()}</p>
        <h1 className="font-display text-2xl font-medium text-stone-800 md:text-3xl text-balance">
          {getGreeting()}, Admin
        </h1>
        <p className="mt-1 text-sm text-stone-500">Berikut ringkasan data website Desa Sukobubuk hari ini.</p>
      </header>

      <DashboardLive initialStats={initialStats} />
    </div>
  )
}
