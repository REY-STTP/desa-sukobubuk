import { z } from 'zod'
import { booleanLike, idSchema, shortText } from './common'

export const pesanCreateSchema = z.object({
  nama: shortText(200),
  email: z.string().trim().toLowerCase().email('Format email tidak valid'),
  isi_pesan: z.string().trim().min(10, 'Pesan minimal 10 karakter').max(5000, 'Pesan maksimal 5000 karakter'),
})

export const pesanPatchSchema = z.object({
  is_read: booleanLike,
})

export const pesanIdParam = z.object({
  id: idSchema,
})

export type PesanCreateInput = z.infer<typeof pesanCreateSchema>
export type PesanPatchInput = z.infer<typeof pesanPatchSchema>
