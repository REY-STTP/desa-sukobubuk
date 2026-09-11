-- TASK-REV-01 — ulasan produk sungguhan (rating + komentar termoderasi).
--
-- Diterapkan via `prisma db execute` + `migrate resolve --applied
-- <dirname>` mengikuti preseden 20260911_add_produk_available_index,
-- karena `migrate dev` rusak di repo ini (shadow replay P1014).
-- Idempoten (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS "ulasan" (
  "id" SERIAL NOT NULL,
  "produk_id" INTEGER NOT NULL,
  "nama" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "komentar" TEXT NOT NULL,
  "is_approved" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ulasan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ulasan_produk_id_is_approved_created_at_idx" ON "ulasan"("produk_id", "is_approved", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ulasan_produk_id_fkey'
  ) THEN
    ALTER TABLE "ulasan" ADD CONSTRAINT "ulasan_produk_id_fkey"
      FOREIGN KEY ("produk_id") REFERENCES "produk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
