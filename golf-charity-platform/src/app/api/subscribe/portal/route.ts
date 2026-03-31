import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPortalSession } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const session = await createPortalSession(
      sub.stripe_customer_id,
      `${appUrl}/dashboard/settings`
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Portal error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
