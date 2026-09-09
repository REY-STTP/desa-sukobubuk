-- F-212 / GEO-001 — Phase 05 — add per-UMKM `kecamatan` column.
-- Additive, non-destructive: nullable, no default, so existing rows stay NULL.
-- Render layer (`lib/structured-data.ts:localBusinessLd`) falls back to
-- 'Margorejo' (the canonical kecamatan for Desa Sukobubuk) when null.

ALTER TABLE "umkm" ADD COLUMN "kecamatan" TEXT;
