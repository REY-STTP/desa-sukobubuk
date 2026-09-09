import { z } from 'zod'
import { shortText, urlSchema } from './common'

const KATEGORI_PEJABAT = ['kepala', 'sekretaris', 'kasi', 'kaur', 'kadus'] as const

export const pejabatItemSchema = z.object({
  jabatan: shortText(200),
  nama: shortText(200),
  kategori: z.enum(KATEGORI_PEJABAT),
  foto_url: urlSchema,
})

export const pejabatUpdateSchema = z.object({
  pejabat: z.array(pejabatItemSchema).max(100, 'Maksimal 100 pejabat'),
})

export type PejabatItemInput = z.infer<typeof pejabatItemSchema>
export type PejabatUpdateInput = z.infer<typeof pejabatUpdateSchema>
