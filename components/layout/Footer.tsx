import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail, ExternalLink, Clock } from 'lucide-react'
import { SiInstagram, SiTiktok } from "react-icons/si";
import { prisma } from '@/lib/prisma'

export default async function Footer() {
  const profil = await prisma.profilDesa.findFirst({
    select: {
      nama_desa: true,
      nama_kecamatan: true,
      nama_kabupaten: true,
      nama_provinsi: true,
      alamat_kantor: true,
      telepon: true,
      email: true,
      jam_pelayanan: true,
      maps_embed_url: true,
      maps_link: true,
    },
  })

  const namaDesa = profil?.nama_desa ?? 'Desa Sukobubuk'

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                <Image
                  src="/images/logo-desa.png"
                  alt={namaDesa}
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-display font-bold text-white text-sm leading-tight">{namaDesa}</p>
                <p className="text-xs text-gray-400 leading-tight">{profil?.nama_kabupaten ?? 'Kab. Pati'}, {profil?.nama_provinsi ?? 'Jawa Tengah'}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-5">
              Website resmi Pemerintah {namaDesa}, {profil?.nama_kecamatan ?? 'Kecamatan Margorejo'}, {profil?.nama_kabupaten ?? 'Kabupaten Pati'}, {profil?.nama_provinsi ?? 'Jawa Tengah'}.
            </p>
            <div className="flex items-center gap-2">
              {[
                { href: 'https://www.instagram.com/kkn.sttpsukobubuk', icon: SiInstagram, label: 'Instagram' },
                { href: 'https://www.tiktok.com/@kknsttp.sukobubuk', icon: SiTiktok, label: 'TikTok' },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-700 flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Navigasi</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Beranda' },
                { href: '/profil/sejarah', label: 'Sejarah Desa' },
                { href: '/profil/visi-misi', label: 'Visi & Misi' },
                { href: '/profil/struktur-organisasi', label: 'Struktur Organisasi' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-2 h-px bg-primary-400 transition-all duration-200 rounded-full" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-white font-semibold mt-7 mb-4 text-xs uppercase tracking-widest">Layanan</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/berita', label: 'Berita & Pengumuman' },
                { href: '/umkm', label: 'Direktori UMKM' },
                { href: '/kontak', label: 'Hubungi Kami' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-1.5 group">
                    <span className="w-0 group-hover:w-2 h-px bg-primary-400 transition-all duration-200 rounded-full" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Kontak</h4>
            <ul className="space-y-3 mb-5">
              {profil?.alamat_kantor && (
                <li className="flex gap-3">
                  <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400 leading-relaxed">{profil.alamat_kantor}</span>
                </li>
              )}
              {profil?.telepon && (
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-sm text-gray-400">{profil.telepon}</span>
                </li>
              )}
              {profil?.email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-sm text-gray-400">{profil.email}</span>
                </li>
              )}
              {profil?.jam_pelayanan && (
                <li className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                  <span className="text-sm text-gray-400">Senin - Jum'at: {profil.jam_pelayanan}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Google Maps */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-widest">Lokasi Kami</h4>
            <div className="rounded-xl overflow-hidden border border-gray-700">
              <iframe
                src={profil?.maps_embed_url || 'https://www.google.com/maps?q=Desa+Sukobubuk+Margorejo+Pati&output=embed'}
                width="100%" height="200"
                style={{ border: 0, display: 'block' }}
                loading="lazy" allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Desa"
              />
            </div>
            {profil?.maps_link && (
              <a href={profil.maps_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2.5 text-xs text-primary-400 hover:text-primary-300 transition-colors duration-200">
                <MapPin className="w-3 h-3" /> Buka di Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

        </div>
      </div>

      <div className="border-t border-gray-800 py-4">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-center text-center gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Pemerintah {namaDesa}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}