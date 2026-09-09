import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

/**
 * P2-E1: petakan error Prisma yang umum ke status HTTP yang tepat,
 * dengan pesan Indonesia yang konsisten. TIDAK membocorkan detail
 * internal (target/field constraint) ke klien.
 * - P2025 (record not found) → 404
 * - P2002 (unique constraint / slug duplikat) → 409
 * - P2003 (FK gagal) → 404 (entitas terkait tak ada)
 * - lainnya → 500 generik dengan pesan fallback per-route
 */
export function prismaErrorResponse(error: unknown, fallbackMessage: string): NextResponse {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug sudah digunakan' }, { status: 409 })
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Data terkait tidak ditemukan' }, { status: 404 })
    }
  }
  return NextResponse.json({ error: fallbackMessage }, { status: 500 })
}
