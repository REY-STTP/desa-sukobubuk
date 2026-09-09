/**
 * F-104 / PERF-001 — decide whether an image URL should bypass the
 * Next.js image optimizer.
 *
 * `true` (skip optimization) only for:
 *   - The legacy `/uploads/...` local path (no longer served on Vercel,
 *     but still in the DB from before the SEC-006 migration).
 *   - `null` / `undefined` / empty string — but those are guarded by the
 *     caller's conditional render, so we never reach here.
 *
 * `false` (let Next.js optimize via the configured `remotePatterns`) for
 *   - `https://res.cloudinary.com/...`
 *   - Any other absolute HTTPS URL.
 *
 * The default branch is `false` (optimize) because most production
 * thumbnails are Cloudinary URLs.
 */
export function shouldSkipImageOptimization(src: string | null | undefined): boolean {
  if (!src) return true
  return src.startsWith('/uploads/')
}
