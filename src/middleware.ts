import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/api/auth/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') ||
    publicRoutes.some(route => pathname.startsWith(route))
  ) {
    return NextResponse.next()
  }

  // Check for auth token in cookie
  const authToken = request.cookies.get('auth-token')?.value

  // If no auth token, redirect to login page
  if (!authToken) {
    const loginUrl = new URL('/login', request.url)
    // Add redirect parameter to return to original page after login
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Validate the token (basic validation - decode and check format)
  try {
    const decoded = atob(authToken)
    const [username, timestamp] = decoded.split(':')

    // Check if token has valid format
    if (!username || !timestamp) {
      throw new Error('Invalid token format')
    }

    // Check token expiry (7 days)
    const tokenAge = Date.now() - parseInt(timestamp)
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

    if (tokenAge > maxAge) {
      // Token expired, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }

    return NextResponse.next()
  } catch {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
