import { z } from 'zod'
import { emailSchema, shortText } from './common'

const namaSchema = shortText(200)
const passwordSchema = z.string().min(8, 'Password minimal 8 karakter').max(200)

export const pengaturanSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('nama'),
    nama: namaSchema,
  }),
  z.object({
    type: z.literal('email'),
    email: emailSchema,
    password: passwordSchema,
  }),
  z.object({
    type: z.literal('password'),
    passwordLama: passwordSchema,
    passwordBaru: passwordSchema,
  }),
])

export type PengaturanInput = z.infer<typeof pengaturanSchema>
