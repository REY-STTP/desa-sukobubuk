-- F-209 / Phase 02 — AUTH-002 (failed-login lockout) and AUTH-003
-- (session_version-based invalidation).
--
-- 1. `users.session_version` is bumped on signOut. The `jwt` callback in
--    `lib/auth.ts` compares the JWT's `sessionVersion` to the latest
--    `users.session_version` and rejects the token on mismatch.
--
-- 2. `failed_logins` records every failed attempt; `lib/auth-lockout.ts`
--    counts rows in the last 15 minutes per email and blocks the attempt
--    if the count is >= 5. Successful logins clear the rows.
--
-- Both additions are non-destructive: existing rows in `users` get
-- `session_version = 0` (the default), so existing JWTs (which have
-- `sessionVersion: undefined` from before this migration) will all be
-- rejected on the next request — by design, this forces re-auth once
-- after the migration is applied.

ALTER TABLE "users"
  ADD COLUMN "session_version" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "failed_logins" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "email" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_logins_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "failed_logins" ADD CONSTRAINT "failed_logins_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "failed_logins_email_created_at_idx" ON "failed_logins"("email", "created_at");
CREATE INDEX IF NOT EXISTS "failed_logins_ip_created_at_idx"    ON "failed_logins"("ip", "created_at");
