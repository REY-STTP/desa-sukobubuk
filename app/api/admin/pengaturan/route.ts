import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-guard'
import bcrypt from 'bcryptjs'

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin()
  if ('error' in guard) return guard.error
  const { session } = guard

  const body = await req.json()
  const { type } = body

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    if (type === 'nama') {
      if (!body.nama?.trim()) return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 })
      await prisma.user.update({ where: { id: user.id }, data: { name: body.nama.trim() } })
      return NextResponse.json({ success: true })
    }

    if (type === 'email') {
      if (!body.email || !body.password) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
      const isValid = await bcrypt.compare(body.password, user.password)
      if (!isValid) return NextResponse.json({ error: 'Password salah' }, { status: 400 })
      const exists = await prisma.user.findUnique({ where: { email: body.email } })
      if (exists) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 })
      await prisma.user.update({ where: { id: user.id }, data: { email: body.email } })
      return NextResponse.json({ success: true })
    }

    if (type === 'password') {
      if (!body.passwordLama || !body.passwordBaru) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
      if (body.passwordBaru.length < 8) return NextResponse.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
      const isValid = await bcrypt.compare(body.passwordLama, user.password)
      if (!isValid) return NextResponse.json({ error: 'Password lama salah' }, { status: 400 })
      const hashed = await bcrypt.hash(body.passwordBaru, 12)
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Tipe tidak dikenali' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
