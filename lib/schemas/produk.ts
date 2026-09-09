import { z } from 'zod'
import { booleanLike, idSchema, richText, shortText, slugSchema, urlSchema } from './common'

export const produkCreateSchema = z.object({
  nama_produk: shortText(200),
  slug: slugSchema.optional(),
  deskripsi: richText(5000),
  harga: z.coerce
    .number({ invalid_type_error: 'Harga harus angka' })
    .positive('Harga harus lebih dari 0')
    .max(99_999_999_999.99, 'Harga terlalu besar'),
  umkm_id: idSchema,
  is_available: booleanLike.optional(),
  foto: urlSchema,
})

export const produkUpdateSchema = produkCreateSchema.partial()

export type ProdukCreateInput = z.infer<typeof produkCreateSchema>
export type ProdukUpdateInput = z.infer<typeof produkUpdateSchema>
