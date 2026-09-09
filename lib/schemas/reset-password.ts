import { z } from 'zod'
import { emailSchema } from './common'

export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
})

export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(8, 'Token tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').max(200),
})

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>
export type ResetPasswordConfirmInput = z.infer<typeof resetPasswordConfirmSchema>
