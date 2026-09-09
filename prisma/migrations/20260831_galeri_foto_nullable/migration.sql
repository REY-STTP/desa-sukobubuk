-- POL-001 (Phase 07) — allow Galeri.foto to be null so seed can use
-- gradient placeholder instead of broken /images/galeri-*.jpg paths.
-- Additive: existing rows keep their foto values; new rows may be null.

ALTER TABLE "galeri" ALTER COLUMN "foto" DROP NOT NULL;
