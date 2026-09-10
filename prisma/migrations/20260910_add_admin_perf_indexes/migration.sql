-- F2-Fase3 / T-30 — index penyeimbang beban admin.
--
-- Bagian A — B-tree composite (dari `@@index(..., map: ...)` di
-- `prisma/schema.prisma`): equality/order/join yang tiap navigasi admin
-- bayar tanpa index (badge unread, join umkm/author, filter featured &
-- kategori, order pejabat, filter audit-log).
--
-- Bagian B — GIN trigram: 5 index histori (`20260829_add_trigram_indexes`)
-- TERCATAT applied tapi TIDAK ADA di DB live (terbukti via
-- `migrate diff`: DB live meminta DROP karena tak menemukannya) —
-- dibuat ulang di sini agar DB == histori. Ditambah 4 trigram untuk
-- kolom search halaman audit-log (`OR ILIKE` 4 kolom, Seq Scan per
-- filter — lihat F0-4). `pg_trgm` idempoten.
--
-- Semua statement idempoten (IF NOT EXISTS). TIDAK ada DROP: bagian
-- DropIndex dari `migrate diff` adalah drift histori-vs-live, bukan
-- keadaan yang diinginkan. Tabel <30 baris — build milidetik, aman
-- jalan langsung (tanpa CONCURRENTLY yang tak didukung di transaksi
-- migrasi; lihat catatan migrasi created_at/trigram sebelumnya).

-- ── A. B-tree ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "pesan_is_read_created_at_idx"      ON "pesan"("is_read", "created_at");
CREATE INDEX IF NOT EXISTS "produk_umkm_id_created_at_idx"     ON "produk"("umkm_id", "created_at");
CREATE INDEX IF NOT EXISTS "berita_author_id_idx"              ON "berita"("author_id");
CREATE INDEX IF NOT EXISTS "umkm_is_featured_created_at_idx"   ON "umkm"("is_featured", "created_at");
CREATE INDEX IF NOT EXISTS "umkm_kategori_idx"                 ON "umkm"("kategori");
CREATE INDEX IF NOT EXISTS "pejabat_desa_kategori_urutan_idx"  ON "pejabat_desa"("kategori", "urutan");
CREATE INDEX IF NOT EXISTS "audit_logs_action_created_at_idx"  ON "audit_logs"("action", "createdAt");
CREATE INDEX IF NOT EXISTS "audit_logs_entity_action_created_at_idx" ON "audit_logs"("entity", "action", "createdAt");

-- ── B. Trigram ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- B1: milik histori, hilang di live — buat ulang persis definisinya.
CREATE INDEX IF NOT EXISTS "berita_judul_trgm"       ON "berita" USING gin ("judul"       gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "umkm_nama_usaha_trgm"    ON "umkm"   USING gin ("nama_usaha"  gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "produk_nama_produk_trgm" ON "produk" USING gin ("nama_produk" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "pesan_nama_trgm"         ON "pesan"  USING gin ("nama"        gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "pesan_isi_trgm"          ON "pesan"  USING gin ("isi_pesan"   gin_trgm_ops);

-- B2: baru — kolom OR-search halaman audit-log (F0-4: Seq Scan + ~~*).
CREATE INDEX IF NOT EXISTS "audit_logs_entity_trgm"   ON "audit_logs" USING gin ("entity"   gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "audit_logs_action_trgm"   ON "audit_logs" USING gin ("action"   gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "audit_logs_useremail_trgm" ON "audit_logs" USING gin ("userEmail" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "audit_logs_entityid_trgm" ON "audit_logs" USING gin ("entityId"  gin_trgm_ops);
