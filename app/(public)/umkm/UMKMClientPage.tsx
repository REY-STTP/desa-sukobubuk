'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Store, Search, Filter, MapPin, ArrowRight, Package, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import PageWrapper from '@/components/animations/PageWrapper'

interface UMKM {
  id: number
  nama_usaha: string
  slug: string
  pemilik: string
  kategori: string
  deskripsi: string
  alamat: string
  whatsapp: string
  logo: string | null
  is_featured: boolean
  created_at: Date
  _count: { produk: number }
}

interface Props {
  umkm: UMKM[]
  kategoriList: string[]
}

const kategoriColors: Record<string, string> = {
  'Makanan': 'bg-amber-100 text-amber-700',
  'Kerajinan': 'bg-purple-100 text-purple-700',
  'Jasa': 'bg-blue-100 text-blue-700',
  'Pertanian': 'bg-primary-100 text-primary-700',
}

export default function UMKMClientPage({ umkm, kategoriList }: Props) {
  const [search, setSearch] = useState('')
  const [kategori, setKategori] = useState('Semua')

  const filtered = umkm.filter((item) => {
    const matchSearch =
      item.nama_usaha.toLowerCase().includes(search.toLowerCase()) ||
      item.pemilik.toLowerCase().includes(search.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(search.toLowerCase())
    const matchKategori = kategori === 'Semua' || item.kategori === kategori
    return matchSearch && matchKategori
  })

  return (
    <PageWrapper>
      <div className="pt-24">
        <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-16">
          <div className="container-custom">
            <div className="flex items-center gap-2 text-primary-300 text-sm mb-3">
              <Store className="w-4 h-4" />
              Direktori UMKM
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold">UMKM Desa Sukobubuk</h1>
            <p className="text-primary-200 mt-2">Temukan produk dan layanan terbaik dari pengusaha lokal kami</p>
          </div>
        </div>

        <div className="container-custom py-12">
          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama usaha, pemilik, atau produk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-11"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {['Semua', ...kategoriList].map((k) => (
                <button
                  key={k}
                  onClick={() => setKategori(k)}
                  className={cn(
                    'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
                    kategori === k
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Menampilkan <span className="font-semibold text-gray-900">{filtered.length}</span> UMKM
            {kategori !== 'Semua' && <span> dalam kategori <span className="font-semibold text-primary-700">{kategori}</span></span>}
            {search && <span> untuk pencarian &quot;<span className="font-semibold">{search}</span>&quot;</span>}
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Store className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Tidak ada UMKM ditemukan</p>
              <p className="text-sm mt-2">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => (
                <Link key={item.id} href={`/umkm/${item.slug}`} className="card group hover:-translate-y-1 transition-transform duration-300">
                  {/* Logo / Cover */}
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-sage-100 relative overflow-hidden">
                    {item.logo ? (
                      <Image
                        src={item.logo}
                        alt={item.nama_usaha}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Store className="w-16 h-16 text-primary-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className={`badge ${kategoriColors[item.kategori] || 'bg-gray-100 text-gray-600'}`}>
                        {item.kategori}
                      </span>
                      {item.is_featured && (
                        <span className="badge bg-yellow-400 text-yellow-900 flex items-center gap-1">
                          <Star className="w-3 h-3" /> Unggulan
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-primary-700 transition-colors">
                      {item.nama_usaha}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Pemilik: {item.pemilik}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.deskripsi}</p>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Package className="w-3 h-3" />
                        {item._count.produk} Produk
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-32">{item.alamat.split(',')[0]}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-primary-600 font-semibold text-sm group-hover:gap-3 transition-all">
                      Lihat Detail <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
