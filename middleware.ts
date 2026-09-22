import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // If Supabase is not configured yet, gracefully bypass auth checks
  // so the application can be explored and tested without crashing
  if (!isSupabaseConfigured()) {
    return supabaseResponse
  }

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

  const { pathname } = request.nextUrl

  // Protected routes that require auth
  const protectedPaths = [
    '/dashboard', '/onboarding', '/urge', '/reset', '/progress',
    '/quests', '/coach', '/profile', '/settings', '/activity',
    '/wellbeing', '/learn', '/community'
  ]
  const isProtected = protectedPaths.some(p => pathname === p || pathname.startsWith(p + '/'))

  // Auth routes — redirect to dashboard if already logged in
  const authPaths = ['/auth/login', '/auth/signup', '/login', '/signup']
  const isAuthPage = authPaths.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
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
