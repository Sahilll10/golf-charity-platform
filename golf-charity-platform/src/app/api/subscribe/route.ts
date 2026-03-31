import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe'
import { PLANS } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const { plan, userId, email } = await req.json()
    if (!plan || !userId || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const planConfig = PLANS[plan as keyof typeof PLANS]
    if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const supabase = createAdminClient()
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle()

    let customerId = existing?.stripe_customer_id
    if (!customerId) {
      const customer = await createStripeCustomer(email, email)
      customerId = customer.id
    }

    const priceId = plan === 'monthly'
      ? process.env.STRIPE_MONTHLY_PRICE_ID!
      : process.env.STRIPE_YEARLY_PRICE_ID!

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await createCheckoutSession({
      customerId,
      priceId,
      userId,
      plan,
      successUrl: `${appUrl}/dashboard?subscribed=true`,
      cancelUrl: `${appUrl}/signup`,
    })

    // Upsert subscription record
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      plan,
      status: 'inactive',
    }, { onConflict: 'user_id' })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Subscribe error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const plan = searchParams.get('plan') || 'monthly'
  return NextResponse.redirect(new URL('/signup?plan=' + plan, req.url))
}
