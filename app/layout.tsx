import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Desa Sukobubuk – Kecamatan Margorejo, Kabupaten Pati',
    template: '%s | Desa Sukobubuk',
  },
  description: 'Website resmi Desa Sukobubuk, Kecamatan Margorejo, Kabupaten Pati, Jawa Tengah. Kode Pos 59163.',
  keywords: ['Desa Sukobubuk', 'Margorejo', 'Kabupaten Pati', 'UMKM', 'Jawa Tengah'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
