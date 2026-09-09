import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendResetPasswordEmail } from '@/lib/mail'
import { parseBody } from '@/lib/parse-body'
import { resetPasswordRequestSchema, resetPasswordConfirmSchema } from '@/lib/schemas/reset-password'
import { rateLimit, clientKey } from '@/lib/rate-limit'
import { logAdminAction, getClientIp } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// POST: Kirim email reset password
export async function POST(req: NextRequest) {
  // F-103: SEC-008 — limit to 3 requests / hour / (IP + email) to prevent
  // email-bombing of arbitrary recipients.
  const body = await req.clone().json().catch(() => null) as { email?: string } | null
  const emailForKey = (body?.email ?? 'unknown').toLowerCase()
  const rl = rateLimit({
    key: clientKey(req, 'resetpw', emailForKey),
    limit: 3,
    windowSec: 3600,
  })
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  const parsed = await parseBody(req, resetPasswordRequestSchema)
  if (parsed instanceof NextResponse) return parsed
  const { email } = parsed.data

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    // Selalu return success untuk keamanan (tidak reveal apakah email exist)
    if (!user) return NextResponse.json({ success: true })

    // Buat token baru. P1-A2: yang disimpan di DB adalah hash SHA-256 —
    // bocor DB/backup tidak memberikan link reset pakai-ulang. Token
    // mentah hanya dikirim via email dan tidak disimpan di mana pun.
    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const expires_at = new Date(Date.now() + 60 * 60 * 1000) // 1 jam

    // P2-E3: transaksional — gagal di tengah tak menyisakan user tanpa token.
    await prisma.$transaction([
      prisma.passwordReset.deleteMany({ where: { user_id: user.id } }),
      prisma.passwordReset.create({
        data: { user_id: user.id, token: tokenHash, expires_at },
      }),
    ])

    await logAdminAction({
      userId: user.id,
      userEmail: email,
      action: 'CREATE',
      entity: 'auth',
      entityId: user.id,
      payload: { type: 'reset_request', email },
      ip: getClientIp(req),
    })

    await sendResetPasswordEmail(email, token, user.name)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal mengirim email' }, { status: 500 })
  }
}

// PUT: Eksekusi reset password dengan token
export async function PUT(req: NextRequest) {
  // P1-A2: batasi tebakan token (10/jam/IP). Token 256-bit tidak
  // brute-forceable, tapi batas ini menutup enumeration tak terbatas.
  const rlPut = rateLimit({ key: clientKey(req, 'resetput'), limit: 10, windowSec: 3600 })
  if (!rlPut.ok) {
    return NextResponse.json(
      { error: 'Terlalu banyak permintaan. Coba lagi nanti.' },
      { status: 429, headers: { 'Retry-After': String(rlPut.retryAfterSec) } }
    )
  }

  const parsed = await parseBody(req, resetPasswordConfirmSchema)
  if (parsed instanceof NextResponse) return parsed
  const { token, password } = parsed.data
  // P1-A2: cocokkan via hash (DB hanya menyimpan hash, lihat POST).
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  try {
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    })

    if (!resetRecord) return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 })
    if (resetRecord.used) return NextResponse.json({ error: 'Token sudah digunakan' }, { status: 400 })
    if (new Date() > resetRecord.expires_at) {
      return NextResponse.json({ error: 'Token sudah kadaluarsa. Silakan minta link baru.' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // P1-A2: klaim single-use secara atomik — dua PUT konkuren tidak bisa
    // sama-sama lolos (hanya 1 yang dapat count 1). Cek di atas hanya
    // untuk pesan error yang ramah; penegaknya adalah klaim ini.
    const claim = await prisma.passwordReset.updateMany({
      where: { token: tokenHash, used: false, expires_at: { gt: new Date() } },
      data: { used: true },
    })
    if (claim.count === 0) {
      return NextResponse.json({ error: 'Token sudah digunakan' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: resetRecord.user_id },
      data: { password: hashedPassword, session_version: { increment: 1 } },
    })

    await logAdminAction({
      userId: resetRecord.user_id,
      userEmail: (resetRecord as { user?: { email?: string } }).user?.email ?? null,
      action: 'UPDATE',
      entity: 'auth',
      entityId: resetRecord.user_id,
      payload: { type: 'reset_confirm' },
      ip: getClientIp(req),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal reset password' }, { status: 500 })
  }
}
