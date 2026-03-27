import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function proxy(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Izinkan akses ke login, lupa-password, reset-password tanpa token
        if (
          pathname === '/admin/login' ||
          pathname === '/admin/lupa-password' ||
          pathname.startsWith('/admin/reset-password')
        ) {
          return true
        }
        // Semua route /admin/* lainnya harus login
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*'],
}