// Prisma 6 config — replaces the legacy `prisma` key in package.json.
// F-DEP-001 (Phase 06) — silences the v7 deprecation warning and keeps
// seed config in TypeScript for type safety.
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
})
