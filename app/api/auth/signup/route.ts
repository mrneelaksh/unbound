import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { dbCreateUser, dbFindUserByEmail } from '@/lib/db'
import { hashPassword, createLocalSession, checkRateLimit } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const rateCheck = checkRateLimit(`signup_${ip}`, 10, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many signup attempts. Please wait ${rateCheck.resetInSeconds}s.` },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { firstName, email, password, confirmPassword } = body

    if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
      return NextResponse.json(
        { error: 'Please enter your first name.' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()
    const cleanFirstName = firstName.trim()

    // Supabase Auth delegation
    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            first_name: cleanFirstName,
            display_name: cleanFirstName,
          },
        },
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        user: {
          id: data.user?.id,
          email: cleanEmail,
          firstName: cleanFirstName,
        },
      })
    }

    // Local Development Auth
    const existing = dbFindUserByEmail(cleanEmail)
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      )
    }

    const userId = crypto.randomUUID()
    const passwordHash = hashPassword(password)

    dbCreateUser({
      id: userId,
      email: cleanEmail,
      firstName: cleanFirstName,
      passwordHash,
    })

    await createLocalSession(userId)

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: cleanEmail,
        firstName: cleanFirstName,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An unexpected error occurred during account creation.' },
      { status: 500 }
    )
  }
}
