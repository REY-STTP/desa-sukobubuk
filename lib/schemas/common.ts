import { z } from 'zod'

/**
 * Common zod primitives reused across all admin schemas.
 * Centralized here to keep field length / format rules in sync.
 */

export const idSchema = z.coerce.number().int().positive()

export const slugSchema = z
  .string()
  .min(1, 'Slug tidak boleh kosong')
  .max(200, 'Slug maksimal 200 karakter')
  .regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung')

export const urlSchema = z
  .string()
  .url('URL tidak valid')
  .max(500, 'URL maksimal 500 karakter')
  .optional()
  .or(z.literal('').transform(() => undefined))

export const shortText = (max: number) =>
  z
    .string()
    .trim()
    .min(1, 'Field wajib diisi')
    .max(max, `Field maksimal ${max} karakter`)

export const longText = (max: number) =>
  z.string().max(max, `Field maksimal ${max} karakter`).optional().or(z.literal('').transform(() => ''))

export const richText = (max: number) =>
  z
    .string()
    .min(1, 'Konten wajib diisi')
    .max(max, `Konten maksimal ${max} karakter`)

export const booleanLike = z.preprocess((v) => {
  if (typeof v === 'boolean') return v
  if (v === 'true' || v === 1 || v === '1') return true
  if (v === 'false' || v === 0 || v === '0') return false
  return v
}, z.boolean())

export const whatsappSchema = z
  .string()
  .trim()
  .regex(/^62\d{8,}$/, 'Format 628xxx (tanpa + atau 0)')

export const emailSchema = z.string().trim().toLowerCase().email('Format email tidak valid')
