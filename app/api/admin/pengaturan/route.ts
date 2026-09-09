import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import { parseBody } from '@/lib/parse-body'
import { pengaturanSchema } from '@/lib/schemas/pengaturan'
import { logAdminAction, getClientIp } from '@/lib/audit'
import bcrypt from 'bcryptjs'

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error
  const { session } = guard

  const parsed = await parseBody(req, pengaturanSchema)
  if (parsed instanceof NextResponse) return parsed

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    if (parsed.data.type === 'nama') {
      await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.nama } })
      await logAdminAction({
        userId: user.id,
        userEmail: session.user.email,
        action: 'UPDATE',
        entity: 'pengaturan',
        entityId: user.id,
        payload: { type: 'nama', nama: parsed.data.nama },
        ip: getClientIp(req),
      })
      return NextResponse.json({ success: true })
    }

    if (parsed.data.type === 'email') {
      const isValid = await bcrypt.compare(parsed.data.password, user.password)
      if (!isValid) return NextResponse.json({ error: 'Password salah' }, { status: 400 })
      const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } })
      if (exists) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 })
      await prisma.user.update({
        where: { id: user.id },
        // P1-A1: ganti email = identitas baru → matikan semua sesi lain.
        data: { email: parsed.data.email, session_version: { increment: 1 } },
      })
      await logAdminAction({
        userId: user.id,
        userEmail: session.user.email,
        action: 'UPDATE',
        entity: 'pengaturan',
        entityId: user.id,
        payload: { type: 'email', email: parsed.data.email },
        ip: getClientIp(req),
      })
      return NextResponse.json({ success: true })
    }

    if (parsed.data.type === 'password') {
      const isValid = await bcrypt.compare(parsed.data.passwordLama, user.password)
      if (!isValid) return NextResponse.json({ error: 'Password lama salah' }, { status: 400 })
      const hashed = await bcrypt.hash(parsed.data.passwordBaru, 12)
      // P1-A1: ganti password mematikan semua sesi lain (termasuk sesi curian).
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed, session_version: { increment: 1 } },
      })
      await logAdminAction({
        userId: user.id,
        userEmail: session.user.email,
        action: 'UPDATE',
        entity: 'pengaturan',
        entityId: user.id,
        payload: { type: 'password', changed: true },
        ip: getClientIp(req),
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Tipe tidak dikenali' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
