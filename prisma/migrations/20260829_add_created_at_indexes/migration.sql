-- F-206: DB-001 — add `created_at` B-tree indexes on the five list-backed
-- tables so admin and public list pages stop full-scanning as data grows.
--
-- Generated from `prisma/schema.prisma` (see the `@@index([created_at])`
-- directives on UMKM, Produk, Berita, Galeri, Pesan).
--
-- Trigram GIN indexes for text search are added in a follow-up migration
-- (see `20260829_add_trigram_indexes/migration.sql`) because `pg_trgm` is an
-- extension and Prisma cannot model GIN indexes in `schema.prisma`.
--
-- Safe to run during a low-traffic window. CONCURRENTLY would be even safer
-- but is not supported inside a single Prisma migration; the indexes are
-- small relative to typical village-portal row counts (< 10k rows).

CREATE INDEX IF NOT EXISTS "umkm_created_at_idx" ON "umkm"("created_at");
CREATE INDEX IF NOT EXISTS "produk_created_at_idx" ON "produk"("created_at");
CREATE INDEX IF NOT EXISTS "berita_created_at_idx" ON "berita"("created_at");
CREATE INDEX IF NOT EXISTS "galeri_created_at_idx" ON "galeri"("created_at");
CREATE INDEX IF NOT EXISTS "pesan_created_at_idx" ON "pesan"("created_at");
