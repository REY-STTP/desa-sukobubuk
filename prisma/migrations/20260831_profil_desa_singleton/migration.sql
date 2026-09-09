-- F-205 / DB-002 — enforce ProfilDesa singleton.
-- Step 1: collapse all existing rows to a single row (id=1) by deleting
-- the others. The application has only one admin who manages this table,
-- so destructive cleanup is acceptable in dev. In production with no
-- other ProfilDesa rows, this is a no-op.
DELETE FROM "profil_desa" WHERE "id" != 1;

-- Step 2: add the singleton column (default 0). All rows get singleton=0.
ALTER TABLE "profil_desa" ADD COLUMN "singleton" INTEGER NOT NULL DEFAULT 0;

-- Step 3: enforce uniqueness — only one ProfilDesa row can exist.
CREATE UNIQUE INDEX "profil_desa_singleton_key" ON "profil_desa"("singleton");
