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
import { getProfilLengkap } from '@/lib/cache'

/**
 * P3-I1: ikon sosmed inline (ganti `react-icons/si` yang hanya dipakai
 * untuk 2 ikon ini). Path disalin dari simple-icons agar visual identik;
 * `react-icons` dihapus dari dependencies.
 */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
    </svg>
  )
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  )
}

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
    // P1-C2: baca dari cache bersama (tag profil, revalidate 1 jam).
    profil = await getProfilLengkap()
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
      icon: InstagramIcon,
      label: 'Instagram',
    },
    {
      href: 'https://www.tiktok.com/@kknsttp.sukobubuk',
      icon: TiktokIcon,
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
                  src="/images/logo-desa.webp"
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
                aria-label={`Buka lokasi ${namaDesa} di Google Maps`}
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
