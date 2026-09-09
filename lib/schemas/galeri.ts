import { z } from 'zod'
import { shortText } from './common'

// File metadata is parsed from multipart form data; only the
// human-typed title is validated as a string.

export const galeriCreateSchema = z.object({
  judul: shortText(200),
})

export type GaleriCreateInput = z.infer<typeof galeriCreateSchema>
