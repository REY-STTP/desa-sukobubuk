'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Store, Package, Newspaper, Images, MessageSquare, Mail, ArrowRight, Plus, MailOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { StatTile, StatNumber, StatLabel } from '@/components/ui/stat-tile'
import { EmptyState } from '@/components/ui/empty-state'

type Stats = {
  totalUMKM: number
  totalProduk: number
  totalBerita: number
  totalGaleri: number
  totalPesan: number
  pesanBelumDibaca: number
  pesanTerbaru: { id: number; nama: string; email: string; isi_pesan: string; is_read: boolean; created_at: string }[]
}

function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ')
}

export default function DashboardLive({ initialStats }: { initialStats: Stats }) {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>(initialStats)
  const [live, setLive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastRefreshRef = useRef(0)

  const fetchStats = useCallback(async (showLive = true) => {
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' })
      if (!res.ok) return
      const data: Stats = await res.json()
      setStats((prev) => {
        const changed = JSON.stringify(prev) !== JSON.stringify(data)
        if (changed && showLive) {
          setLive(true)
          setTimeout(() => setLive(false), 1800)
          // keep sidebar badge in sync — debounced agar tidak tabrakan dengan AdminLiveRefresh
          const now = Date.now()
          if (now - lastRefreshRef.current > 2500) {
            lastRefreshRef.current = now
            router.refresh()
          }
        }
        return data
      })
    } catch {
      // silent — polling will retry
    }
  }, [router])

  useEffect(() => {
    const onFocus = () => fetchStats(false)
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchStats(false)
    }
    const onAdminMutated = () => fetchStats(true)

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('admin:mutated' as any, onAdminMutated)

    // polling — 30s (sebelumnya 8s, terlalu sering + tabrakan dengan AdminLiveRefresh)
    timerRef.current = setInterval(() => fetchStats(true), 30000)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('admin:mutated' as any, onAdminMutated)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetchStats])

  const cards = [
    { label: 'UMKM', value: stats.totalUMKM, icon: <Store className="size-5" />, tone: 'sage' as const, href: '/admin/umkm' },
    { label: 'Produk', value: stats.totalProduk, icon: <Package className="size-5" />, tone: 'ember' as const, href: '/admin/produk' },
    { label: 'Berita', value: stats.totalBerita, icon: <Newspaper className="size-5" />, tone: 'stone' as const, href: '/admin/berita' },
    { label: 'Galeri', value: stats.totalGaleri, icon: <Images className="size-5" />, tone: 'muted' as const, href: '/admin/galeri' },
    { label: 'Pesan', value: stats.totalPesan, icon: <MessageSquare className="size-5" />, tone: 'sage' as const, href: '/admin/pesan' },
    {
      label: 'Belum Dibaca',
      value: stats.pesanBelumDibaca,
      icon: <Mail className="size-5" />,
      tone: 'ember' as const,
      href: '/admin/pesan',
      highlight: stats.pesanBelumDibaca > 0,
    },
  ]

  const quickActions = [
    { href: '/admin/umkm', label: 'Tambah UMKM', icon: <Store className="size-4" />, tone: 'sage' as const },
    { href: '/admin/produk', label: 'Tambah Produk', icon: <Package className="size-4" />, tone: 'ember' as const },
    { href: '/admin/berita', label: 'Tulis Berita', icon: <Newspaper className="size-4" />, tone: 'stone' as const },
    { href: '/admin/galeri', label: 'Upload Foto', icon: <Images className="size-4" />, tone: 'muted' as const },
  ]

  return (
    <>
      {/* Live indicator */}
      <div className="flex items-center justify-end gap-2 text-[11px]">
        <span className={cn('size-2 rounded-full transition-colors', live ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300')} />
        <span className={cn('transition-colors', live ? 'text-emerald-700 font-medium' : 'text-stone-400')}>
          {live ? 'Diperbarui' : 'Live — sinkron otomatis'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6">
        {cards.map((card, i) => (
          <Link key={card.label} href={card.href} className="group transition-transform hover:-translate-y-0.5">
            <StatTile
              icon={card.icon}
              tone={card.tone}
              variant="default"
              size={i === 0 ? 'lg' : 'md'}
              className={cn('h-full flex-col items-start', card.highlight && 'ring-1 ring-ember-300 bg-ember-50/40')}
            >
              <StatNumber className={cn(i === 0 ? 'text-4xl' : 'text-2xl')}>
                {card.value.toLocaleString('id-ID')}
              </StatNumber>
              <StatLabel className="text-sm font-medium text-stone-700">{card.label}</StatLabel>
              {card.highlight && (
                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-ember-700">Butuh perhatian</span>
              )}
            </StatTile>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
        <div className="surface-elevated lg:col-span-2">
          <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
            <div>
              <h2 className="font-display text-base font-medium text-stone-800">Pesan Masuk Terbaru</h2>
              <p className="text-xs text-stone-500">{stats.pesanTerbaru.length} pesan terakhir</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/pesan">
                Lihat semua
                <ArrowRight className="size-3.5" data-icon="inline-end" />
              </Link>
            </Button>
          </div>

          {stats.pesanTerbaru.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<MailOpen className="size-5" />} title="Belum ada pesan" description="Pesan dari halaman kontak akan muncul di sini." size="sm" />
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {stats.pesanTerbaru.map((pesan) => (
                <li key={pesan.id} className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-stone-50">
                  <div aria-hidden className={cn('mt-1.5 size-2 shrink-0 rounded-full', pesan.is_read ? 'bg-stone-300' : 'bg-sage-500')} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-stone-800">{pesan.nama}</p>
                      <p className="shrink-0 text-[11px] text-stone-400">{formatDate(new Date(pesan.created_at))}</p>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-stone-600">{pesan.isi_pesan}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface-elevated">
          <div className="border-b border-stone-100 px-5 py-4">
            <h2 className="font-display text-base font-medium text-stone-800">Aksi Cepat</h2>
            <p className="text-xs text-stone-500">Tambah konten baru</p>
          </div>
          <div className="grid grid-cols-2 gap-2 p-4">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-start gap-2 rounded-xl border border-stone-200 p-3 transition-all hover:border-sage-300 hover:bg-stone-50"
              >
                <span
                  className={cn(
                    'grid size-9 shrink-0 place-items-center rounded-xl',
                    item.tone === 'sage' && 'bg-sage-100 text-sage-700',
                    item.tone === 'ember' && 'bg-ember-100 text-ember-700',
                    item.tone === 'stone' && 'bg-stone-200 text-stone-700',
                    item.tone === 'muted' && 'bg-stone-100 text-stone-600'
                  )}
                >
                  {item.icon}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-stone-700">
                  {item.label}
                  <Plus className="size-3 opacity-60" data-icon="inline-end" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
