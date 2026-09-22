import { NextResponse } from 'next/server'
import { createCheckoutSession, type CheckoutRequest } from '@/lib/payment'

export async function POST(request: Request) {
  try {
    const body: CheckoutRequest = await request.json()

    if (!body.planId || !['free', 'trial', 'pro', 'max'].includes(body.planId)) {
      return NextResponse.json(
        { error: 'Invalid plan identifier specified.' },
        { status: 400 }
      )
    }

    const session = await createCheckoutSession(body)
    return NextResponse.json(session, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to initialize checkout session.' },
      { status: 500 }
    )
  }
}
