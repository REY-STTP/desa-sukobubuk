import { handlers } from '@/lib/auth'

// Auth.js v5 — `handlers` sudah berisi GET + POST yang terikat ke config
// di `lib/auth.ts` (pengganti `NextAuth(authOptions)` v4).
export const { GET, POST } = handlers
