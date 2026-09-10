import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Tag as UTag } from '@/components/ui/tag'
import PengaturanForm from './PengaturanForm'

export const metadata: Metadata = { title: 'Pengaturan Akun' }

export default async function PengaturanPage() {
  // F2 (T-22): `auth()` di sini disengaja, bukan duplikasi yang bisa
  // dihapus — layout tidak bisa meneruskan sesi lewat `{children}`
  // (opaque) dan `SessionProvider` hanya terbaca komponen client.
  // Yang dihemat adalah cek DB-nya: via cache T-21 (`session_version`
  // keyed-by-version, 45s), pemanggilan kedua dalam jendela ini = hit
  // memori, bukan RTT pooler. Jangan "bersihkan" baris ini.
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { email: session!.user.email },
    select: { id: true, name: true, email: true, role: true, created_at: true },
  })

  const tanggalGabung = user?.created_at
    ? new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(user.created_at)
    : '-'

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-medium text-stone-800">
          Pengaturan Akun
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Kelola informasi dan keamanan akun admin Anda
        </p>
      </header>

      <div className="surface-elevated p-5">
        <div className="flex items-center gap-4 border-b border-stone-100 pb-5">
          <div className="grid size-14 place-items-center rounded-2xl bg-sage-700 text-white font-display text-xl font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-medium text-stone-800 truncate">
              {user?.name}
            </p>
            <p className="text-sm text-stone-500 break-all font-mono">{user?.email}</p>
            <div className="mt-1.5">
              <UTag tone="sage" size="sm" className="capitalize">
                {user?.role}
              </UTag>
            </div>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-stone-50 p-3">
            <dt className="text-xs text-stone-500">Bergabung sejak</dt>
            <dd className="mt-1 font-medium text-stone-800">{tanggalGabung}</dd>
          </div>
          <div className="rounded-xl bg-stone-50 p-3">
            <dt className="text-xs text-stone-500">Role</dt>
            <dd className="mt-1 font-medium text-stone-800 capitalize">
              {user?.role}
            </dd>
          </div>
        </dl>
      </div>

      <PengaturanForm user={user!} />
    </div>
  )
}
