import { Store, Package, Users, Trophy } from 'lucide-react'
import StaggerContainer, { StaggerItem } from '@/components/animations/StaggerContainer'
import AnimatedCounter from '@/components/animations/AnimatedCounter'

interface Props {
  totalUMKM: number
  totalProduk: number
}

export default function StatsSection({ totalUMKM, totalProduk }: Props) {
  const stats = [
    { icon: Store, value: totalUMKM, label: 'UMKM Terdaftar', color: 'text-primary-600', bg: 'bg-primary-50', isNumber: true },
    { icon: Package, value: totalProduk, label: 'Produk Tersedia', color: 'text-blue-600', bg: 'bg-blue-50', isNumber: true },
    { icon: Users, value: 3500, label: 'Penduduk', color: 'text-amber-600', bg: 'bg-amber-50', isNumber: true, prefix: '± ' },
    { icon: Trophy, value: 2024, label: 'Desa Digital', color: 'text-rose-600', bg: 'bg-rose-50', isNumber: true },
  ]

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="container-custom">
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" staggerDelay={0.1}>
          {stats.map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 group cursor-default">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="font-display font-bold text-2xl text-gray-900">
                    <AnimatedCounter value={stat.value} prefix={stat.prefix} />
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
