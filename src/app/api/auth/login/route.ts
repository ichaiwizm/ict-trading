import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Get credentials from environment variables
    const validUsername = process.env.AUTH_USERNAME || 'admin'
    const validPassword = process.env.AUTH_PASSWORD

    // Validate credentials
    if (!validPassword) {
      return NextResponse.json(
        { success: false, message: 'Configuration serveur incomplète' },
        { status: 500 }
      )
    }

    if (username === validUsername && password === validPassword) {
      // Generate a simple token (in production, use JWT or similar)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')

      const response = NextResponse.json({
        success: true,
        user: username,
        token: token,
        message: 'Connexion réussie',
      })

      // Set HTTP-only cookie for additional security
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return response
    }

    return NextResponse.json(
      { success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}
