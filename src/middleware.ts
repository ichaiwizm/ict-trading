import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip auth for static files and API health checks if needed
  const { pathname } = request.nextUrl

  // Allow public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Get the authorization header
  const authHeader = request.headers.get('authorization')

  // Check if we have valid credentials
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ')

    if (scheme === 'Basic' && encoded) {
      const decoded = atob(encoded)
      const [username, password] = decoded.split(':')

      // Check credentials against environment variables
      const validUsername = process.env.AUTH_USERNAME || 'admin'
      const validPassword = process.env.AUTH_PASSWORD

      if (validPassword && username === validUsername && password === validPassword) {
        return NextResponse.next()
      }
    }
  }

  // If no valid auth, request credentials
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="ICT Trading - Enter credentials"',
    },
  })
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
