/**
 * F2 (T-21) — cache memori singkat hasil cek `session_version`.
 *
 * Masalah: tiap `auth()` (proxy + layout + `requireAdmin`) menjalankan
 * callback `jwt` di `lib/auth.ts` yang query
 * `user.findUnique(select: session_version)` → 2-3x RTT pooler per load
 * admin. Cache ini memangkas cek ulang dalam jendela singkat.
 *
 * Keamanan (jangan dilonggarkan):
 * - Key = `sv:{userId}:{tokenSessionVersion}` — mencakup VERSION, bukan
 *   userId saja. Logout/bump version membuat key lama tak pernah cocok
 *   lagi, jadi revoke berlaku seketika walau dalam TTL.
 * - Hanya hasil POSITIF yang di-cache. Mismatch → poison token seperti
 *   semula (tidak di-cache). DB error → fail-closed seperti semula
 *   (tidak di-cache).
 * - TTL 45s (≤60s sesuai TASKS). Jendela revoke teoritis ≤45s untuk sesi
 *   yang DIBIARKAN (bukan logout — logout ganti version → langsung mati).
 * - Per-instance (serverless). Cold-start = miss → query sekali. Benar.
 */
const TTL_MS = 45_000
const MAX_ENTRIES = 1000

/** TTL diekspor agar test + dokumentasi merujuk satu angka. */
export const SESSION_VERSION_TTL_MS = TTL_MS

// key → epoch-ms kedaluwarsa.
const freshUntil = new Map<string, number>()

function key(userId: string, sessionVersion: number): string {
  return `sv:${userId}:${sessionVersion}`
}

export function isSessionVersionFresh(userId: string, sessionVersion: number): boolean {
  const k = key(userId, sessionVersion)
  const exp = freshUntil.get(k)
  if (exp === undefined) return false
  if (exp <= Date.now()) {
    freshUntil.delete(k)
    return false
  }
  return true
}

export function rememberSessionVersion(userId: string, sessionVersion: number): void {
  if (freshUntil.size >= MAX_ENTRIES) {
    // Map terurut FIFO — buang yang tertua. Single-admin: tak terjangkau.
    const oldest = freshUntil.keys().next()
    if (!oldest.done) freshUntil.delete(oldest.value)
  }
  freshUntil.set(key(userId, sessionVersion), Date.now() + TTL_MS)
}

/** Test-only: reset state antar kasus uji. */
export function _resetSessionVersionCache(): void {
  freshUntil.clear()
}
