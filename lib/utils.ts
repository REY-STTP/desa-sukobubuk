import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function slugify(text: string): string {
  // POL-006 (Phase 07) — handle Indonesian diacritics & non-ASCII.
  // NFD splits é→e+´, then strip combining marks, so "Élève"→"eleve".
  // Normalize en-dash/em-dash to hyphen before stripping so
  // "Sukobubuk–Margorejo"→"sukobubuk-margorejo".
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2013\u2014\u2015]/g, '-')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/**
 * P1-B4: deteksi tipe gambar dari magic bytes (bukan dari MIME klien yang
 * bisa dipalsu). Kembalikan MIME yang terdeteksi, atau null bila bukan
 * JPEG/PNG/WEBP valid. Mencegah file teks/SVG polyglot berlabel image/png.
 */
export function detectImageType(buffer: Uint8Array): string | null {
  if (buffer.length < 12) return null
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png'
  }
  const riff = String.fromCharCode(buffer[0], buffer[1], buffer[2], buffer[3])
  const webp = String.fromCharCode(buffer[8], buffer[9], buffer[10], buffer[11])
  if (riff === 'RIFF' && webp === 'WEBP') {
    return 'image/webp'
  }
  return null
}

/**
 * P1-B2: normalisasi pagination dari input tak tepercaya (query string).
 * Non-numerik/negatif/nol → default aman (tidak pernah NaN/negatif ke Prisma).
 */
export function clampPage(value: unknown, def = 1): number {
  const n =
    typeof value === 'string'
      ? parseInt(value, 10)
      : typeof value === 'number'
        ? Math.floor(value)
        : NaN
  return Number.isFinite(n) && (n as number) >= 1 ? (n as number) : def
}

export function clampLimit(value: unknown, def = 10, max = 50): number {
  const n =
    typeof value === 'string'
      ? parseInt(value, 10)
      : typeof value === 'number'
        ? Math.floor(value)
        : NaN
  if (!Number.isFinite(n) || (n as number) < 1) return def
  return Math.min(n as number, max)
}
