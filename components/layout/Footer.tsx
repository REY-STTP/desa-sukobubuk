import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Clock,
  ArrowUpRight,
} from 'lucide-react'
import { SiInstagram, SiTiktok } from 'react-icons/si'
import { prisma } from '@/lib/prisma'

export default async function Footer() {
  let profil: {
    nama_desa: string | null
    nama_kecamatan: string | null
    nama_kabupaten: string | null
    nama_provinsi: string | null
    alamat_kantor: string | null
    telepon: string | null
    email: string | null
    jam_pelayanan: string | null
    whatsapp: string | null
    maps_embed_url: string | null
    maps_link: string | null
  } | null = null

  try {
    profil = await prisma.profilDesa.findFirst({
      select: {
        nama_desa: true,
        nama_kecamatan: true,
        nama_kabupaten: true,
        nama_provinsi: true,
        alamat_kantor: true,
        telepon: true,
        email: true,
        jam_pelayanan: true,
        whatsapp: true,
        maps_embed_url: true,
        maps_link: true,
      },
    })
  } catch {
    // DB down — pakai fallback (profil tetap null, UI pakai default)
  }

  const namaDesa = profil?.nama_desa ?? 'Desa Sukobubuk'

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/profil/sejarah', label: 'Sejarah Desa' },
    { href: '/profil/visi-misi', label: 'Visi & Misi' },
    { href: '/profil/struktur-organisasi', label: 'Struktur Organisasi' },
  ]

  const serviceLinks = [
    { href: '/berita', label: 'Berita & Pengumuman' },
    { href: '/umkm', label: 'Direktori UMKM' },
    { href: '/kontak', label: 'Hubungi Kami' },
  ]

  const socials = [
    {
      href: 'https://www.instagram.com/kkn.sttpsukobubuk',
      icon: SiInstagram,
      label: 'Instagram',
    },
    {
      href: 'https://www.tiktok.com/@kknsttp.sukobubuk',
      icon: SiTiktok,
      label: 'TikTok',
    },
  ]

  const waLink = profil?.whatsapp
    ? `https://wa.me/${profil.whatsapp}?text=Halo%20${encodeURIComponent(
        namaDesa
      )}`
    : null

  return (
    <footer className="relative overflow-hidden bg-sage-900 text-stone-200">
      {/* Subtle grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grain opacity-40"
      />

      <div className="relative container-custom py-14 md:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          {/* ─── Zone 1: Brand & Identitas (lg:col-span-4) ─── */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Image
                  src="/images/logo-desa.png"
                  alt={namaDesa}
                  width={48}
                  height={48}
                  className="size-full object-contain"
                />
              </span>
              <span>
                <span className="block font-display text-base font-semibold leading-tight text-white">
                  {namaDesa}
                </span>
                <span className="block text-[11px] leading-tight text-stone-400">
                  {profil?.nama_kecamatan ?? 'Kec. Margorejo'},{' '}
                  {profil?.nama_kabupaten ?? 'Kab. Pati'}
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-stone-400">
              Website resmi Pemerintah {namaDesa}. Portal informasi desa,
              berita, UMKM, dan layanan administrasi warga.
            </p>

            {/* Socials */}
            <div className="mt-6 flex items-center gap-2">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group grid size-10 place-items-center rounded-xl bg-white/5 text-stone-300 ring-1 ring-white/10 transition-all duration-200 hover:bg-sage-700 hover:text-white hover:ring-sage-500"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ─── Zone 2: Navigasi & Layanan (lg:col-span-4) ─── */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-4">
            <div>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                Navigasi
              </h4>
              <ul className="space-y-2.5">
                {navLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-stone-300 transition-colors duration-200 hover:text-white"
                    >
                      <span
                        aria-hidden
                        className="h-px w-0 rounded-full bg-sage-400 transition-all duration-200 group-hover:w-2"
                      />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                Layanan
              </h4>
              <ul className="space-y-2.5">
                {serviceLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-stone-300 transition-colors duration-200 hover:text-white"
                    >
                      <span
                        aria-hidden
                        className="h-px w-0 rounded-full bg-sage-400 transition-all duration-200 group-hover:w-2"
                      />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ─── Zone 3: Kontak Ringkas + Mini-map (lg:col-span-4) ─── */}
          <div className="lg:col-span-4">
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-400">
              Kontak &amp; Lokasi
            </h4>
            <ul className="space-y-3 text-sm">
              {profil?.alamat_kantor && (
                <li className="flex gap-2.5 text-stone-300">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-sage-400" />
                  <span className="leading-relaxed">{profil.alamat_kantor}</span>
                </li>
              )}
              {profil?.telepon && (
                <li className="flex items-center gap-2.5 text-stone-300">
                  <Phone className="size-4 shrink-0 text-sage-400" />
                  <a
                    href={`tel:${profil.telepon}`}
                    className="hover:text-white"
                  >
                    {profil.telepon}
                  </a>
                </li>
              )}
              {profil?.email && (
                <li className="flex items-center gap-2.5 text-stone-300">
                  <Mail className="size-4 shrink-0 text-sage-400" />
                  <a
                    href={`mailto:${profil.email}`}
                    className="break-all hover:text-white"
                  >
                    {profil.email}
                  </a>
                </li>
              )}
              {profil?.jam_pelayanan && (
                <li className="flex items-start gap-2.5 text-stone-300">
                  <Clock className="mt-0.5 size-4 shrink-0 text-sage-400" />
                  <span>Senin – Jum&apos;at: {profil.jam_pelayanan}</span>
                </li>
              )}
            </ul>

            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sage-700/40 px-3 py-1.5 text-xs font-medium text-sage-200 ring-1 ring-inset ring-sage-500/30 transition-colors hover:bg-sage-700/60 hover:text-white"
              >
                Chat via WhatsApp
                <ArrowUpRight className="size-3" />
              </a>
            )}

            {/* Mini-map */}
            {profil?.maps_embed_url && (
              <div className="mt-5 overflow-hidden rounded-xl border border-white/10 ring-1 ring-inset ring-white/5">
                <iframe
                  src={profil.maps_embed_url}
                  width="100%"
                  height="140"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Desa"
                />
              </div>
            )}
            {profil?.maps_link && (
              <a
                href={profil.maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-sage-300 transition-colors duration-200 hover:text-white"
              >
                <MapPin className="size-3" />
                Buka di Google Maps
                <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="container-custom flex flex-col items-center justify-between gap-3 py-5 text-xs text-stone-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()} Pemerintah {namaDesa}. Hak cipta
            dilindungi.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/kebijakan-privasi"
              className="transition-colors hover:text-white"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/syarat-ketentuan"
              className="transition-colors hover:text-white"
            >
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
