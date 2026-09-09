import { z } from 'zod'
import { richText, shortText, slugSchema, urlSchema } from './common'

export const beritaCreateSchema = z.object({
  judul: shortText(200),
  slug: slugSchema.optional(),
  konten: richText(100000),
  thumbnail: urlSchema,
})

export const beritaUpdateSchema = z.object({
  judul: shortText(200).optional(),
  slug: slugSchema.optional(),
  konten: richText(100000).optional(),
  thumbnail: urlSchema,
})

export type BeritaCreateInput = z.infer<typeof beritaCreateSchema>
export type BeritaUpdateInput = z.infer<typeof beritaUpdateSchema>
