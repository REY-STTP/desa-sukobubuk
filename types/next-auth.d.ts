import 'next-auth'
import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      // F-208 / DB-004 (Phase 06) — role is a Prisma enum, not a free-form
      // string. Currently only `Role.ADMIN` is in use.
      role: Role
    }
    // F-209 / AUTH-003: snapshot of `User.session_version` at sign-in time.
    // Compared against the latest `User.session_version` on every request;
    // mismatch means the user has logged out (or been force-revoked) and
    // the JWT is rejected.
    sessionVersion?: number
  }
}

// Auth.js v5: tipe JWT dideklarasikan di `@auth/core/jwt` — `next-auth/jwt`
// hanya me-re-export-nya, sehingga `declare module 'next-auth/jwt'` TIDAK
// lagi menempel (augmentasi senyap tidak berlaku). Targetkan modul aslinya.
declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: Role
    sessionVersion?: number
  }
}
