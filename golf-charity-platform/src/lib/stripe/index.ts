import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export async function createStripeCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name })
}

export async function createCheckoutSession(params: {
  customerId: string
  priceId: string
  userId: string
  plan: 'monthly' | 'yearly'
  successUrl: string
  cancelUrl: string
}) {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    payment_method_types: ['card'],
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { userId: params.userId, plan: params.plan },
    subscription_data: {
      metadata: { userId: params.userId, plan: params.plan },
    },
    allow_promotion_codes: true,
  })
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId)
}
