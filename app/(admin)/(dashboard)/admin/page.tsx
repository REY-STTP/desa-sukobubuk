import { prisma } from '@/lib/prisma'
import { Store, Package, Newspaper, Images, MessageSquare, Mail } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

async function getDashboardStats() {
  const [totalUMKM, totalProduk, totalBerita, totalGaleri, totalPesan, pesanBelumDibaca, pesanTerbaru] =
    await Promise.all([
      prisma.uMKM.count(),
      prisma.produk.count(),
      prisma.berita.count(),
      prisma.galeri.count(),
      prisma.pesan.count(),
      prisma.pesan.count({ where: { is_read: false } }),
      prisma.pesan.findMany({ take: 5, orderBy: { created_at: 'desc' } }),
    ])
  return { totalUMKM, totalProduk, totalBerita, totalGaleri, totalPesan, pesanBelumDibaca, pesanTerbaru }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    { label: 'Total UMKM', value: stats.totalUMKM, icon: Store, color: 'bg-emerald-500', href: '/admin/umkm' },
    { label: 'Total Produk', value: stats.totalProduk, icon: Package, color: 'bg-blue-500', href: '/admin/produk' },
    { label: 'Total Berita', value: stats.totalBerita, icon: Newspaper, color: 'bg-amber-500', href: '/admin/berita' },
    { label: 'Foto Galeri', value: stats.totalGaleri, icon: Images, color: 'bg-purple-500', href: '/admin/galeri' },
    { label: 'Total Pesan', value: stats.totalPesan, icon: MessageSquare, color: 'bg-rose-500', href: '/admin/pesan' },
    { label: 'Belum Dibaca', value: stats.pesanBelumDibaca, icon: Mail, color: 'bg-orange-500', href: '/admin/pesan' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan data website Desa Sukobubuk</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-display font-bold text-2xl text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pesan terbaru */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pesan Masuk Terbaru</h2>
            <Link href="/admin/pesan" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Lihat Semua →
            </Link>
          </div>

          {stats.pesanTerbaru.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Belum ada pesan masuk</p>
          ) : (
            <div className="space-y-3">
              {stats.pesanTerbaru.map((pesan) => (
                <div key={pesan.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${pesan.is_read ? 'bg-gray-300' : 'bg-primary-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">{pesan.nama}</p>
                      <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(pesan.created_at)}</p>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{pesan.isi_pesan}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/umkm', label: 'Tambah UMKM', icon: Store, color: 'text-emerald-600 bg-emerald-50' },
              { href: '/admin/produk', label: 'Tambah Produk', icon: Package, color: 'text-blue-600 bg-blue-50' },
              { href: '/admin/berita', label: 'Tulis Berita', icon: Newspaper, color: 'text-amber-600 bg-amber-50' },
              { href: '/admin/galeri', label: 'Upload Foto', icon: Images, color: 'text-purple-600 bg-purple-50' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
