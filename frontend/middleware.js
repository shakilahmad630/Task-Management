import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register']

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('taskapp_token')?.value

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  // Not authenticated → redirect to login (except public paths)
  if (!token && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Already authenticated → redirect away from auth pages
  if (token && isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
}
