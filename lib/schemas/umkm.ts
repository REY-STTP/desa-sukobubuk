import { z } from 'zod'
import { booleanLike, shortText, slugSchema, urlSchema, whatsappSchema } from './common'

const KATEGORI = ['Makanan', 'Kerajinan', 'Jasa', 'Pertanian', 'Perdagangan', 'Lainnya'] as const

export const umkmCreateSchema = z.object({
  nama_usaha: shortText(200),
  slug: slugSchema.optional(),
  pemilik: shortText(200),
  kategori: z.enum(KATEGORI),
  deskripsi: shortText(5000),
  alamat: shortText(500),
  kecamatan: z.string().trim().max(100).optional(),
  whatsapp: whatsappSchema,
  is_featured: booleanLike.optional(),
  logo: urlSchema,
})

export const umkmUpdateSchema = umkmCreateSchema.partial()

export type UmkmCreateInput = z.infer<typeof umkmCreateSchema>
export type UmkmUpdateInput = z.infer<typeof umkmUpdateSchema>
