# GolfDraw — Golf Charity Subscription Platform

> A subscription-based platform combining golf score tracking, monthly prize draws, and charitable giving.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + Framer Motion |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe (subscriptions + webhooks) |
| Deployment | Vercel |

---

## Project Structure

```
src/
  app/
    (public)/          ← Homepage, charities, how-it-works
    (auth)/            ← Login, signup, forgot-password
    auth/              ← Supabase callback + update-password
    dashboard/         ← Subscriber portal (protected)
    admin/             ← Admin panel (admin-only)
    api/               ← API routes
      webhooks/stripe/ ← Stripe webhook handler
      subscribe/       ← Checkout + billing portal
      scores/          ← Score CRUD
      draws/           ← Draw management
      charities/       ← Charity CRUD
      winners/         ← Verification management
  components/
    dashboard/         ← Dashboard UI components
    admin/             ← Admin UI components
  lib/
    supabase/          ← Browser + server clients
    stripe/            ← Stripe helpers
    draw-engine/       ← Core draw algorithm
    utils.ts           ← Shared utilities
  types/
    index.ts           ← All TypeScript types
```

---

## Deployment Guide (Step-by-Step)

### Step 1 — Supabase Setup (new account)

1. Go to [supabase.com](https://supabase.com) → Create account → New project
2. Note your **Project URL** and **anon key** from Settings → API
3. Go to **SQL Editor** → paste and run `supabase/schema.sql`
4. Go to **SQL Editor** → paste and run `supabase/seed.sql` (after creating test accounts)
5. Go to **Storage** → Create two buckets:
   - `winner-proofs` → Private
   - `charity-logos` → Public
6. In **Settings → Auth → URL Configuration**:
   - Site URL: `https://your-vercel-url.vercel.app`
   - Redirect URLs: `https://your-vercel-url.vercel.app/auth/callback`

### Step 2 — Stripe Setup (new account)

1. Go to [stripe.com](https://stripe.com) → Create account
2. Go to **Products** → Add product:
   - **Monthly Plan**: £19.99/month recurring → Copy price ID
   - **Yearly Plan**: £199.99/year recurring → Copy price ID
3. Go to **Developers → API Keys** → Copy publishable + secret keys
4. Webhooks will be set up after Vercel deployment (Step 5)

### Step 3 — Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...         ← Set after Step 5
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

NEXT_PUBLIC_APP_URL=https://your-vercel-url.vercel.app
```

### Step 4 — Deploy to Vercel (new account)

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit — GolfDraw platform"
git remote add origin https://github.com/YOURUSERNAME/golf-charity-platform
git push -u origin main
```

1. Go to [vercel.com](https://vercel.com) → Create account → Import project
2. Select your GitHub repo
3. Add all environment variables from `.env.local`
4. Deploy — note your `https://your-app.vercel.app` URL

### Step 5 — Stripe Webhooks

1. In Stripe Dashboard → **Developers → Webhooks** → Add endpoint
2. URL: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the **Signing secret** → add as `STRIPE_WEBHOOK_SECRET` in Vercel

### Step 6 — Create Test Users

1. Visit your live URL → Sign up with `subscriber@test.com` / `Test1234!`
2. Sign up with `admin@test.com` / `Admin1234!`
3. In Supabase SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'admin@test.com';
   ```
4. Run the demo subscription seed from `supabase/seed.sql`

---

## Testing Checklist

### Subscriber Flow
- [ ] Sign up → email verification
- [ ] Choose plan → Stripe checkout (use card `4242 4242 4242 4242`)
- [ ] Redirected to dashboard after payment
- [ ] Enter 5 golf scores → draw numbers generated
- [ ] Select charity
- [ ] View draw countdown and prize pool
- [ ] View draws history page
- [ ] View winnings page

### Admin Flow
- [ ] Log in as admin → redirected to `/admin`
- [ ] View admin dashboard stats
- [ ] View users list + search
- [ ] Create draw for next month
- [ ] Run draw on open draw → winning numbers generated
- [ ] View + approve/reject winner verifications
- [ ] Mark winner as paid
- [ ] Add/edit/toggle charity
- [ ] View reports page

### Draw System
- [ ] Score submission generates correct draw numbers
- [ ] Draw run produces 5 winning numbers (1–49)
- [ ] Prize pool split: 40% jackpot / 35% 4-match / 25% 3-match
- [ ] Jackpot rollover works when no 5-match winner

---

## Stripe Test Cards

| Card | Behaviour |
|------|-----------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure |
| `4000 0000 0000 9995` | Payment declined |

Use any future expiry date and any 3-digit CVV.

---

## Admin Credentials (after seed)
- **Admin**: `admin@test.com` / `Admin1234!`
- **Subscriber**: `subscriber@test.com` / `Test1234!`

---

## Prize Pool Algorithm

```
Monthly subscription: £19.99
  → 30% to prize pool (£5.99)
  → 10% to charity (£2.00)
  → 60% to operations (£12.00)

Prize pool split:
  → 40% jackpot (5-match) — rolls over if no winner
  → 35% to 4-match winners (split equally)
  → 25% to 3-match winners (split equally)
```

## Score → Draw Number Algorithm

Each of the 5 golf scores is mapped to a draw number (1–49) via:
```
multipliers = [1, 2, 3, 5, 7]
number = (score × multiplier) mod 49
if result == 0, use 49
```

This ensures the same scores always produce the same draw numbers, making it fully deterministic and auditable.
