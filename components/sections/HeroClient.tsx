'use client'

import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedCounter from '@/components/animations/AnimatedCounter'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: 'easeOut' as const },
})

interface Props {
  namaDesa: string
  namaKecamatan: string
  namaKabupaten: string
  namaProvinsi: string
  kodePos: string
  jumlahPenduduk: number
  tahunBerdiri: string
  totalUMKM: number
  totalProduk: number
}

export default function HeroClient({
  namaDesa,
  namaKecamatan,
  namaKabupaten,
  namaProvinsi,
  kodePos,
  jumlahPenduduk,
  tahunBerdiri,
  totalUMKM,
  totalProduk,
}: Props) {
  const stats = [
    jumlahPenduduk > 0 && { value: jumlahPenduduk, label: 'Jiwa', prefix: '± ' },
    totalUMKM > 0 && { value: totalUMKM, label: 'UMKM Aktif', suffix: '+' },
    totalProduk > 0 && { value: totalProduk, label: 'Produk Lokal', suffix: '+' },
    tahunBerdiri && { value: Number(tahunBerdiri), label: 'Tahun Berdiri', format: false },
  ].filter(Boolean) as {
    value: number
    label: string
    prefix?: string
    suffix?: string
    format?: boolean
  }[]

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Video Background */}
      <video
        src="https://res.cloudinary.com/dtsnhei95/video/upload/f_auto,q_auto/v1774572204/hero-bg_ccrlcv.mp4"
        autoPlay
        muted
        loop
        playsInline
        poster="https://res.cloudinary.com/dtsnhei95/video/upload/so_1/v1774572204/hero-bg_ccrlcv.jpg"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Overlay gelap + hijau agar teks tetap terbaca */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary-950/80 via-primary-900/70 to-sage-800/60" />

      {/* Animated background blobs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl opacity-10 z-10"
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-64 h-64 bg-sage-400 rounded-full blur-3xl opacity-10 z-10"
        animate={{ scale: [1, 1.2, 1], x: [0, -15, 0], y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="container-custom relative z-20 py-20">
        <div className="max-w-3xl">
          {/* Badge lokasi */}
          <motion.div {...fadeUp(0.1)}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 rounded-full px-4 py-2 text-sm font-medium mb-8">
            <MapPin className="w-4 h-4 text-primary-400" />
            Kec. {namaKecamatan} · Kab. {namaKabupaten} · {namaProvinsi} · {kodePos}
          </motion.div>

          {/* Title */}
          <motion.h1 {...fadeUp(0.25)} className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            {namaDesa.toLowerCase().startsWith('desa ') ? (
              <>
                Desa{' '}
                <span className="text-primary-400 italic">{namaDesa.slice(5)}</span>
              </>
            ) : (
              <span className="text-primary-400 italic">{namaDesa}</span>
            )}
          </motion.h1>

          <motion.p {...fadeUp(0.4)} className="text-xl text-white/70 leading-relaxed mb-10 max-w-2xl">
            Selamat datang di website resmi {namaDesa}. Temukan informasi seputar profil desa, berita terkini, dan direktori UMKM lokal kami.
          </motion.p>

          <motion.div {...fadeUp(0.55)} className="flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/umkm" className="btn-primary bg-primary-500 hover:bg-primary-400 shadow-lg shadow-primary-900/50">
                Jelajahi UMKM
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/profil/sejarah" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200">
                Profil Desa
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Stats ribbon */}
      {stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-0 left-0 right-0 z-20 bg-black/20 backdrop-blur-sm border-t border-white/10"
        >
          <div className="container-custom py-5">
            <div className="flex flex-wrap gap-8 items-center">
              {stats.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-1 h-8 bg-primary-500 rounded-full" />
                  <div>
                    <p className="text-white font-bold text-lg leading-none">
                      <AnimatedCounter
                        value={item.value}
                        prefix={item.prefix}
                        suffix={item.suffix}
                        format={item.format ?? true}
                      />
                    </p>
                    <p className="text-white/60 text-xs">{item.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </section>
  )
}