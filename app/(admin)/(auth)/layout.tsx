import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SessionProvider from '@/components/admin/SessionProvider'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (session) redirect('/admin')

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}
