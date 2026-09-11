import { z } from 'zod'
import { booleanLike, idSchema, shortText } from './common'

// TASK-REV-01 — ulasan produk sungguhan. Pola meniru `lib/schemas/pesan.ts`:
// semua mutasi lewat `parseBody(req, schema)` agar shape error konsisten
// `{ error, issues }`. Rating 1-5 divalidasi di application layer.

export const ulasanCreateSchema = z.object({
  produk_id: idSchema,
  nama: shortText(100),
  rating: z.coerce.number().int('Rating harus bilangan bulat').min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5'),
  komentar: z.string().trim().min(10, 'Ulasan minimal 10 karakter').max(1000, 'Ulasan maksimal 1000 karakter'),
})

export const ulasanPatchSchema = z.object({
  is_approved: booleanLike,
})

export type UlasanCreateInput = z.infer<typeof ulasanCreateSchema>
export type UlasanPatchInput = z.infer<typeof ulasanPatchSchema>
