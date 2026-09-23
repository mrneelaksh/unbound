import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server'
import { dbFindUserByEmail, dbCreatePasswordReset } from '@/lib/db'
import { checkRateLimit } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const rateCheck = checkRateLimit(`forgot_${ip}`, 3, 60000)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rateCheck.resetInSeconds}s.` },
        { status: 429 }
      )
    }

    const { email } = await request.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    if (isSupabaseConfigured()) {
      const supabase = await createSupabaseServerClient()
      const origin = request.headers.get('origin') || 'http://localhost:3000'
      await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${origin}/auth/reset-password`,
      })

      return NextResponse.json({
        success: true,
        message: 'If an account exists with that email, reset instructions have been sent.',
      })
    }

    // Local dev: create reset token
    const user = dbFindUserByEmail(cleanEmail)
    let resetLink: string | null = null

    if (user) {
      const token = crypto.randomBytes(24).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      dbCreatePasswordReset(token, user.id, expiresAt)
      resetLink = `/auth/reset-password?token=${token}`
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, reset instructions have been sent.',
      // For local development convenience, we provide the reset link directly if in dev mode
      devResetLink: process.env.NODE_ENV !== 'production' ? resetLink : undefined,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
