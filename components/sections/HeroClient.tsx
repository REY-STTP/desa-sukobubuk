'use client'

import Link from 'next/link'
import { ArrowRight, MapPin, TreePine, Users, Store, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { StatTile, StatNumber, StatLabel } from '@/components/ui/stat-tile'
import AnimatedCounter from '@/components/animations/AnimatedCounter'
import { cn } from '@/lib/utils'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.32, 0.72, 0, 1] as const },
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
    jumlahPenduduk > 0 && {
      icon: <Users className="size-5" />,
      value: jumlahPenduduk,
      label: 'Jiwa',
      prefix: '± ',
    },
    totalUMKM > 0 && {
      icon: <Store className="size-5" />,
      value: totalUMKM,
      label: 'UMKM Aktif',
      suffix: '+',
    },
    totalProduk > 0 && {
      icon: <Sparkles className="size-5" />,
      value: totalProduk,
      label: 'Produk Lokal',
      suffix: '+',
    },
    tahunBerdiri && {
      icon: <TreePine className="size-5" />,
      value: Number(tahunBerdiri),
      label: 'Tahun Berdiri',
    },
  ].filter(Boolean) as {
    icon: React.ReactNode
    value: number
    label: string
    prefix?: string
    suffix?: string
  }[]

  // Pecah nama desa: "Desa Sukobubuk" → "Desa" + "Sukobubuk"
  const splitName = (nama: string) => {
    if (nama.toLowerCase().startsWith('desa ')) {
      return { prefix: 'Desa', name: nama.slice(5) }
    }
    return { prefix: '', name: nama }
  }
  const { prefix, name } = splitName(namaDesa)

  return (
    <section
      className="relative flex min-h-[88svh] items-center overflow-hidden pt-20 md:min-h-[90svh] md:pt-24"
      aria-label="Sambutan Desa Sukobubuk"
    >
      {/* Video background */}
      <video
        src="https://res.cloudinary.com/dtsnhei95/video/upload/f_auto,q_auto/v1774572204/hero-bg_ccrlcv.mp4"
        autoPlay
        muted
        loop
        playsInline
        poster="https://res.cloudinary.com/dtsnhei95/video/upload/so_1/v1774572204/hero-bg_ccrlcv.jpg"
        className="absolute inset-0 z-0 size-full object-cover"
      />

      {/* Gradient overlay — sage tinted, warm (diperkuat untuk kontras teks) */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-sage-950/70"
      />
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-gradient-to-br from-sage-950/90 via-sage-900/75 to-sage-800/60"
      />

      {/* Grain texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-grain opacity-30"
      />

      {/* Animated blobs (subtle) */}
      <motion.div
        aria-hidden
        className="absolute right-20 top-32 z-10 size-96 rounded-full bg-sage-500/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1], x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-32 left-20 z-10 size-64 rounded-full bg-ember-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], x: [0, -15, 0], y: [0, 15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      <div className="container-custom relative z-20 py-16 md:py-24">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left: heading + lead + CTAs (7 cols) */}
          <div className="lg:col-span-7">
            <motion.div {...fadeUp(0.1)}>
              <Tag
                tone="muted"
                className="border border-white/15 bg-white/10 text-stone-100 ring-white/20 backdrop-blur"
              >
                <MapPin className="size-3" />
                {namaKecamatan}, {namaKabupaten}
              </Tag>
            </motion.div>

            <motion.h1
              {...fadeUp(0.2)}
              className="mt-5 font-display text-5xl font-medium leading-[1.05] tracking-tight text-white text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] md:text-6xl lg:text-7xl"
            >
              {prefix && (
                <span className="block text-white/90 text-3xl font-normal drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)] md:text-4xl">
                  {prefix}
                </span>
              )}
              <span className="text-ember-200 italic">{name}</span>
            </motion.h1>

            <motion.p
              {...fadeUp(0.35)}
              className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)]"
            >
              Website resmi Pemerintah Desa {namaDesa}. Portal informasi desa,
              berita terkini, dan direktori UMKM lokal — semua dalam satu
              tempat.
            </motion.p>

            <motion.div
              {...fadeUp(0.5)}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button
                asChild
                size="lg"
                variant="accent"
                className="shadow-elevated-3"
              >
                <Link href="/umkm">
                  Jelajahi UMKM
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/10 text-white backdrop-blur hover:border-white/40 hover:bg-white/15 hover:text-white"
              >
                <Link href="/profil/sejarah">Profil Desa</Link>
              </Button>
            </motion.div>
          </div>

          {/* Right: stats floating card (5 cols) */}
          <motion.div
            {...fadeUp(0.55)}
            className="lg:col-span-5"
          >
            <div className="surface-elevated rounded-3xl bg-white/95 p-6 shadow-elevated-4 backdrop-blur-md md:p-8">
              <p className="section-eyebrow mb-1 text-sage-700">Data Desa</p>
              <p className="font-display text-lg font-medium text-stone-800">
                {namaDesa} dalam Angka
              </p>
              <p className="mt-1 text-xs text-stone-500">
                Kode Pos {kodePos} · {namaProvinsi}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {stats.map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.7 + i * 0.08,
                      duration: 0.4,
                      ease: 'easeOut',
                    }}
                  >
                    <StatTile
                      icon={item.icon}
                      tone="sage"
                      variant="outlined"
                      size="sm"
                      className="h-full"
                    >
                      <StatNumber
                        prefix={item.prefix}
                        suffix={item.suffix}
                        className="text-xl"
                      >
                        <AnimatedCounter
                          value={item.value}
                          prefix={item.prefix}
                          suffix={item.suffix}
                          format
                        />
                      </StatNumber>
                      <StatLabel className="text-xs">{item.label}</StatLabel>
                    </StatTile>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade — subtle, hanya hint transisi */}
      <div
        aria-hidden
        className={cn(
          'absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-b from-transparent to-stone-50/40'
        )}
      />
    </section>
  )
}
