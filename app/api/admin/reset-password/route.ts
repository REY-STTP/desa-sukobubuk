import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendResetPasswordEmail } from '@/lib/mail'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// POST: Kirim email reset password
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })
    // Selalu return success untuk keamanan (tidak reveal apakah email exist)
    if (!user) return NextResponse.json({ success: true })

    // Hapus token lama
    await prisma.passwordReset.deleteMany({ where: { user_id: user.id } })

    // Buat token baru
    const token = crypto.randomBytes(32).toString('hex')
    const expires_at = new Date(Date.now() + 60 * 60 * 1000) // 1 jam

    await prisma.passwordReset.create({
      data: { user_id: user.id, token, expires_at },
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
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetRecord) return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 })
    if (resetRecord.used) return NextResponse.json({ error: 'Token sudah digunakan' }, { status: 400 })
    if (new Date() > resetRecord.expires_at) return NextResponse.json({ error: 'Token sudah kadaluarsa. Silakan minta link baru.' }, { status: 400 })

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.user_id },
        data: { password: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { token },
        data: { used: true },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal reset password' }, { status: 500 })
  }
}
