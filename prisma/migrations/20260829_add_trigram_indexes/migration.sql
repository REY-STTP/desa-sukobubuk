-- F-206: DB-001 (continued) — add trigram GIN indexes for `contains: { mode: 'insensitive' }`
-- text search used in admin and public list pages.
--
-- The list page queries in `lib/cache.ts` use Prisma's `contains` operator
-- with `mode: 'insensitive'`, which on Postgres becomes `ILIKE '%term%'`.
-- Without a trigram index, every such query is a sequential scan.
--
-- `pg_trgm` is required and is created idempotently.
--
-- The build is I/O-heavy on large tables; production should run with
-- `pg_trgm` available and during a low-traffic window. CONCURRENTLY is
-- not supported inside a transaction so we split the GIN index builds
-- out of any future transactional migration.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "berita_judul_trgm"      ON "berita" USING gin ("judul"      gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "umkm_nama_usaha_trgm"  ON "umkm"   USING gin ("nama_usaha" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "produk_nama_produk_trgm" ON "produk" USING gin ("nama_produk" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "pesan_nama_trgm"        ON "pesan"  USING gin ("nama"        gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "pesan_isi_trgm"         ON "pesan"  USING gin ("isi_pesan"   gin_trgm_ops);
