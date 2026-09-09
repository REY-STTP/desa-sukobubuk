-- F-208 / DB-004 (Phase 06) — convert User.role from String to Role enum.
-- The migration is in 3 steps:
--   1. Drop the default (so we can change the type).
--   2. Normalize any non-ADMIN values to ADMIN (the only current role).
--   3. Change the column type to the enum via an explicit cast.

-- Step 0: create the enum type if it does not exist.
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 1: drop the default temporarily.
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

-- Step 2: normalize any values that are not 'ADMIN'.
UPDATE "users" SET "role" = 'ADMIN' WHERE "role" <> 'ADMIN';

-- Step 3: change column type. We use the text cast + enum cast pattern
-- which is the standard PostgreSQL recipe for converting a String column
-- to a custom enum.
ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "Role" USING "role"::text::"Role";

-- Step 4: re-apply the default.
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'ADMIN';
