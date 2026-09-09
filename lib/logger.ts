/**
 * F-109 / OBS-002 — structured JSON logger with request-id propagation.
 *
 * Each log line is a single JSON object so it can be ingested by Vercel
 * log drains, Datadog, or any structured-logging backend. The `requestId`
 * field is auto-generated per invocation and stored in module scope for
 * the duration of a single request (the proxy middleware sets the
 * `x-request-id` header on the request, which `withRequestId` reads).
 *
 * In a future phase this can be replaced by `@sentry/nextjs` `Sentry.logger`
 * or similar — the interface (`info`, `warn`, `error`, `child`) is
 * intentionally minimal to keep the migration cost low.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  requestId?: string
  userId?: string | number
  route?: string
  method?: string
  [key: string]: unknown
}

let currentRequestId: string | undefined

/**
 * P2-F3 — BATASAN SADAR: id disimpan di module-scope per instance server.
 * Pada Vercel/serverless, dua request konkuren dalam instance yang sama
 * bisa saling overwrite (misattribution saat insiden). Ini diterima karena
 * request-id hanya dipakai korelasi best-effort, BUKAN keputusan keamanan.
 * (Alternatif `AsyncLocalStorage` ditolak: menambah kompleksitas pada semua
 * call-site logger tanpa manfaat sepadan untuk skala situs desa.)
 */

export function setRequestId(id: string | undefined): void {
  currentRequestId = id
}

export function getRequestId(): string | undefined {
  return currentRequestId
}

function emit(level: LogLevel, message: string, context: LogContext = {}): void {
  const entry = {
    level,
    time: new Date().toISOString(),
    msg: message,
    requestId: currentRequestId,
    ...context,
  }
  // Vercel captures stdout/stderr; one JSON object per line is the
  // recommended format.
  const line = JSON.stringify(entry)
  if (level === 'error' || level === 'warn') {

    console.error(line)
  } else {

    console.log(line)
  }
}

export const logger = {
  debug(message: string, context: LogContext = {}): void {
    if (process.env.LOG_LEVEL === 'debug') emit('debug', message, context)
  },
  info(message: string, context: LogContext = {}): void {
    emit('info', message, context)
  },
  warn(message: string, context: LogContext = {}): void {
    emit('warn', message, context)
  },
  error(message: string, context: LogContext = {}): void {
    emit('error', message, context)
  },
  child(context: LogContext): {
    debug: (m: string, c?: LogContext) => void
    info: (m: string, c?: LogContext) => void
    warn: (m: string, c?: LogContext) => void
    error: (m: string, c?: LogContext) => void
  } {
    return {
      debug: (m, c = {}) => emit('debug', m, { ...context, ...c }),
      info: (m, c = {}) => emit('info', m, { ...context, ...c }),
      warn: (m, c = {}) => emit('warn', m, { ...context, ...c }),
      error: (m, c = {}) => emit('error', m, { ...context, ...c }),
    }
  },
}
