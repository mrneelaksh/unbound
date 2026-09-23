import { NextResponse, type NextRequest } from 'next/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { dbFindUserByEmail, dbGetProfile, dbGetUserStats } from '@/lib/db'
import { verifyPassword, createLocalSession, checkRateLimit } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const rateCheck = checkRateLimit(`signin_${cleanEmail}_${ip}`, 5, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many sign-in attempts. Please try again in ${rateCheck.resetInSeconds}s.` },
        { status: 429 }
      )
    }

    // Supabase Auth
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        return NextResponse.json(
          { error: 'No account found with these details.' },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      })
    }

    // Local Development Auth
    const user = dbFindUserByEmail(cleanEmail)
    if (!user) {
      return NextResponse.json(
        { error: 'No account found with these details.' },
        { status: 401 }
      )
    }

    const isValid = verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'No account found with these details.' },
        { status: 401 }
      )
    }

    await createLocalSession(user.id)
    const profile = dbGetProfile(user.id)
    const stats = dbGetUserStats(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        displayName: profile?.display_name || user.first_name,
        onboardingCompleted: !!profile?.onboarding_completed,
        totalXP: stats?.total_xp || 0,
        currentStreak: stats?.current_streak || 0,
      },
    })
  } catch (err: any) {
    console.error('Signin error details:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred during sign in.' },
      { status: 500 }
    )
  }
}
