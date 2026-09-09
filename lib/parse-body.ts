import { NextResponse } from 'next/server'
import type { ZodSchema } from 'zod'

/**
 * Parse and validate a request body against a zod schema.
 * Returns either the parsed data (typed) or a 400 NextResponse.
 *
 * Use:
 *   const parsed = parseBody(req, mySchema)
 *   if (parsed instanceof NextResponse) return parsed
 *   // ... use parsed.data
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ data: T } | NextResponse> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body harus berupa JSON valid' }, { status: 400 })
  }
  const result = schema.safeParse(raw)
  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Validasi gagal',
        issues: result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
      { status: 400 }
    )
  }
  return { data: result.data }
}
