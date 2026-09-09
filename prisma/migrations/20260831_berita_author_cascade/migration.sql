-- F-302 / DB-005 — set berita.author_id ON DELETE CASCADE.
-- Non-destructive: existing rows are unaffected by the constraint change.

ALTER TABLE "berita"
  DROP CONSTRAINT IF EXISTS "berita_author_id_fkey";

ALTER TABLE "berita"
  ADD CONSTRAINT "berita_author_id_fkey"
  FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
