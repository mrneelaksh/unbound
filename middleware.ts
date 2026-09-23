import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isSupabaseConfigured } from '@/lib/supabase/config'

const AUTH_SECRET = process.env.AUTH_SECRET || 'unbound_local_dev_secret_key_8492049103'
const AUTH_COOKIE_NAME = 'unbound_session'

async function verifyLocalSessionCookie(signedValue: string | undefined): Promise<boolean> {
  if (!signedValue) return false
  const lastDot = signedValue.lastIndexOf('.')
  if (lastDot === -1) return false

  const value = signedValue.slice(0, lastDot)
  const signatureHex = signedValue.slice(lastDot + 1)
  if (!value || !signatureHex) return false

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(AUTH_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const sigBytes = new Uint8Array(
      signatureHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    )

    return await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(value))
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  // Protected paths that require authentication
  const protectedPaths = [
    '/dashboard',
    '/onboarding',
    '/urge',
    '/reset',
    '/progress',
    '/analytics',
    '/quests',
    '/coach',
    '/profile',
    '/settings',
    '/activity',
    '/wellbeing',
    '/learn',
    '/community',
  ]
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))

  // Auth pages where logged-in users should redirect to /dashboard
  const authPaths = ['/auth/login', '/auth/signup', '/login', '/signup', '/auth/forgot-password']
  const isAuthPage = authPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))

  let isAuthenticated = false

  if (isSupabaseConfigured()) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    isAuthenticated = !!user
  } else {
    // Local secure cookie verification
    const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value
    isAuthenticated = await verifyLocalSessionCookie(sessionCookie)
  }

  // Redirect unauthenticated users trying to access protected paths
  if (!isAuthenticated && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthenticated && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
