import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register']

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('taskapp_token')?.value

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // Not authenticated → redirect to login (except public paths)
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Already authenticated → redirect away from auth pages
  if (token && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
