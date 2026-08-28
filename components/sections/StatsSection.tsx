import { Store, Package, Users, TreePine } from 'lucide-react'
import { Section, SectionHeader } from '@/components/ui/section'
import { StatTile, StatNumber, StatLabel } from '@/components/ui/stat-tile'
import { prisma } from '@/lib/prisma'

export const revalidate = 600

interface Props {
  totalUMKM: number
  totalProduk: number
  totalPenduduk: number
  tahunBerdiri: number
}

export default async function StatsSection({
  totalUMKM,
  totalProduk,
  totalPenduduk,
  tahunBerdiri,
}: Props) {
  // Hitung umur desa — threshold >= 1000 agar 1900 (default) tetap tampil
  const tahunSekarang = new Date().getFullYear()
  const umurDesa = tahunBerdiri >= 1000 ? tahunSekarang - tahunBerdiri : 0

  const stats = [
    {
      icon: <Users className="size-5" />,
      value: totalPenduduk,
      label: 'Penduduk',
      hint: 'jiwa',
      prefix: totalPenduduk > 0 ? '± ' : undefined,
      tone: 'sage' as const,
    },
    {
      icon: <Store className="size-5" />,
      value: totalUMKM,
      label: 'UMKM Aktif',
      hint: 'terdaftar',
      suffix: totalUMKM > 0 ? '+' : undefined,
      tone: 'ember' as const,
    },
    {
      icon: <Package className="size-5" />,
      value: totalProduk,
      label: 'Produk Lokal',
      hint: 'katalog',
      suffix: totalProduk > 0 ? '+' : undefined,
      tone: 'sage' as const,
    },
    {
      icon: <TreePine className="size-5" />,
      value: umurDesa,
      label: 'Tahun Berdiri',
      hint: 'sejak',
      tone: 'stone' as const,
    },
  ]

  return (
    <Section variant="subtle" spacing="default" pattern="topo">
      <SectionHeader
        eyebrow="Potensi Desa"
        heading={<>Sukobubuk dalam angka</>}
        subtitle="Data ringkas tentang warga, UMKM, dan warisan desa kami — diperbarui secara berkala dari sumber resmi."
        align="center"
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <StatTile
            key={stat.label}
            icon={stat.icon}
            tone={stat.tone}
            variant="default"
            size="lg"
            className="flex-col items-start"
          >
            <StatNumber
              prefix={stat.prefix}
              suffix={stat.suffix}
              className="text-3xl md:text-4xl"
            >
              {stat.value > 0 ? stat.value.toLocaleString('id-ID') : '—'}
            </StatNumber>
            <StatLabel className="text-sm font-medium text-stone-700">
              {stat.label}
            </StatLabel>
            <p className="text-xs text-stone-400 mt-0.5">{stat.hint}</p>
          </StatTile>
        ))}
      </div>
    </Section>
  )
}
