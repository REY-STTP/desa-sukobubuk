-- F2-FaseP2 / T-P22 — index filter katalog publik.
--
-- `getUMKMDetail` (`produk where is_available`) dan `getProdukLain`
-- (`where { umkm_id, is_available }`) memfilter tanpa index (Seq Scan +
-- Filter, terbukti via EXPLAIN di T-P00). Idempoten (IF NOT EXISTS).
-- Diterapkan via `prisma db execute` + `migrate resolve --applied
-- 20260911_add_produk_available_index` karena `migrate dev` rusak di repo
-- ini (shadow replay P1014 — lihat catatan README bagian Database).

CREATE INDEX IF NOT EXISTS "produk_umkm_id_is_available_idx" ON "produk"("umkm_id", "is_available");
