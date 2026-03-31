import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { calculatePrizePool } from '@/lib/draw-engine'
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return new NextResponse('No signature', { status: 400 })

  let event: Stripe.Event
  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature error:', err)
    return new NextResponse('Webhook error', { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan

        if (userId && session.subscription) {
          const stripeSubId = session.subscription as string
          const stripeSub = await stripe.subscriptions.retrieve(stripeSubId)

          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: stripeSubId,
            plan,
            status: 'active',
            amount_pence: stripeSub.items.data[0]?.price?.unit_amount,
            renewal_date: new Date(stripeSub.current_period_end * 1000).toISOString(),
          }, { onConflict: 'user_id' })

          // Add to prize pool for current draw month
          const drawMonth = new Date().toISOString().slice(0, 7)
          const amountPence = stripeSub.items.data[0]?.price?.unit_amount || 0
          const pool = calculatePrizePool(amountPence)

          await supabase.from('prize_pool_ledger').insert({
            draw_month: drawMonth,
            source: 'subscription',
            amount: pool.prizePool,
          })

          // Update draw prize pool totals
          const { data: draw } = await supabase
            .from('draws').select('*').eq('draw_month', drawMonth).maybeSingle()

          if (draw) {
            await supabase.from('draws').update({
              prize_pool_total: draw.prize_pool_total + pool.prizePool,
              jackpot_pool: draw.jackpot_pool + (pool.prizePool * 0.40),
              four_match_pool: draw.four_match_pool + (pool.prizePool * 0.35),
              three_match_pool: draw.three_match_pool + (pool.prizePool * 0.25),
              total_entries: draw.total_entries + 1,
            }).eq('id', draw.id)
          }

          // Update charity total raised
          const { data: sub } = await supabase
            .from('subscriptions').select('charity_id').eq('user_id', userId).single()
          if (sub?.charity_id) {
            await supabase.rpc('increment_charity_raised', {
              charity_id: sub.charity_id,
              amount: pool.charityPot,
            }).catch(() => {
              // Fallback if RPC doesn't exist: direct update
              supabase.from('charities')
                .update({ total_raised: supabase.rpc('total_raised') })
                .eq('id', sub.charity_id)
            })
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const status = sub.status === 'active' ? 'active'
          : sub.status === 'past_due' ? 'past_due'
          : sub.status === 'canceled' ? 'cancelled' : 'inactive'

        await supabase.from('subscriptions').update({
          status,
          renewal_date: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabase.from('subscriptions').update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        }).eq('stripe_subscription_id', sub.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await supabase.from('subscriptions').update({
            status: 'past_due',
          }).eq('stripe_subscription_id', invoice.subscription as string)
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
  }

  return new NextResponse('ok', { status: 200 })
}
