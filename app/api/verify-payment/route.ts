import { NextResponse } from 'next/server'
import { verifyPaymentSession, type VerificationRequest } from '@/lib/payment'

export async function POST(request: Request) {
  try {
    const body: VerificationRequest = await request.json()

    if (!body.orderId || !body.paymentId) {
      return NextResponse.json(
        { error: 'Missing required order or payment identifiers.' },
        { status: 400 }
      )
    }

    const verification = await verifyPaymentSession(body)

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error || 'Payment verification failed.' },
        { status: 402 }
      )
    }

    return NextResponse.json(verification, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Server error during payment verification.' },
      { status: 500 }
    )
  }
}
