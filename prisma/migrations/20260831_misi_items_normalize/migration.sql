-- F-303 / DB-006 (Phase 06) — normalize `ProfilDesa.misi` JSON array into
-- a dedicated `misi_items` table.
--
-- Strategy:
--   1. Create the `misi_items` table (with FK + cascade to profil_desa).
--   2. For each existing profil_desa row, parse the JSON `misi` string and
--      insert each array element as a row. The legacy `misi` text column is
--      kept untouched (read-side fallback for clients that haven't migrated
--      yet; the canonical read path is now `misi_items`).
--   3. Idempotent: re-running will not duplicate rows because the migration
--      only inserts from `misi` if the corresponding `misi_items` rows do
--      not already exist (checked via `profil_id` + `text`).

CREATE TABLE "misi_items" (
    "id" SERIAL NOT NULL,
    "profil_id" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "misi_items_pkey" PRIMARY KEY ("id")
);

-- Index (Prisma would emit this as well, see @@index([profil_id, urutan])).
CREATE INDEX IF NOT EXISTS "misi_items_profil_id_urutan_idx" ON "misi_items"("profil_id", "urutan");

-- Foreign key + cascade. The profil_desa PK is `id` (default autoint).
ALTER TABLE "misi_items"
    ADD CONSTRAINT "misi_items_profil_id_fkey"
    FOREIGN KEY ("profil_id") REFERENCES "profil_desa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: parse existing `misi` JSON arrays into rows.
-- Use jsonb_array_elements_text to expand a JSON text[] into rows.
-- IF the column is empty / not JSON / NULL, no rows are created.
DO $$
DECLARE
    r RECORD;
    i INT;
    item TEXT;
BEGIN
    FOR r IN SELECT id, "misi" FROM "profil_desa" WHERE "misi" IS NOT NULL AND "misi" <> '' LOOP
        -- Try to parse as JSON array. If it fails, skip silently.
        IF r.misi ~ '^\s*\[' THEN
            i := 0;
            FOR item IN
                SELECT * FROM jsonb_array_elements_text(r.misi::jsonb)
            LOOP
                -- Idempotency: skip if same text already exists for this profil.
                IF NOT EXISTS (
                    SELECT 1 FROM "misi_items"
                    WHERE "profil_id" = r.id AND "text" = item
                ) THEN
                    INSERT INTO "misi_items" ("profil_id", "text", "urutan")
                    VALUES (r.id, item, i);
                END IF;
                i := i + 1;
            END LOOP;
        END IF;
    END LOOP;
END $$;
