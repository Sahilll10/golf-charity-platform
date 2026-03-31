-- =====================================================
-- SEED TEST USERS
-- Run this AFTER deploying and creating accounts via the signup page
-- =====================================================

-- Step 1: Sign up these two users via your live site UI:
--   subscriber@test.com  / Test1234!
--   admin@test.com       / Admin1234!

-- Step 2: Then run this SQL in Supabase SQL Editor to grant admin role:

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@test.com';

-- Step 3: Verify it worked:
SELECT id, email, role FROM public.profiles;

-- =====================================================
-- SEED DEMO SUBSCRIPTION (for subscriber test account)
-- Run after subscriber@test.com has signed up
-- =====================================================

-- This creates a fake active subscription so the subscriber
-- can access the full dashboard without needing to go through Stripe.
-- For final submission, use real Stripe test payments instead.

INSERT INTO public.subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  plan,
  status,
  amount_pence,
  renewal_date
)
SELECT
  p.id,
  'cus_test_subscriber',
  'sub_test_subscriber',
  'monthly',
  'active',
  1999,
  (now() + interval '30 days')::timestamptz
FROM public.profiles p
WHERE p.email = 'subscriber@test.com'
ON CONFLICT (user_id) DO UPDATE SET
  status = 'active',
  plan = 'monthly',
  renewal_date = (now() + interval '30 days')::timestamptz;

-- =====================================================
-- SEED DEMO DRAW WITH PRIZE POOL
-- =====================================================

INSERT INTO public.draws (
  draw_month,
  status,
  draw_date,
  prize_pool_total,
  jackpot_pool,
  four_match_pool,
  three_match_pool,
  jackpot_rollover,
  total_entries
)
VALUES (
  to_char(now(), 'YYYY-MM'),
  'open',
  (date_trunc('month', now()) + interval '1 month - 1 second'),
  8640.00,
  3456.00,
  3024.00,
  2160.00,
  0,
  143
)
ON CONFLICT (draw_month) DO UPDATE SET
  prize_pool_total = 8640.00,
  jackpot_pool = 3456.00,
  four_match_pool = 3024.00,
  three_match_pool = 2160.00,
  status = 'open',
  total_entries = 143;

-- =====================================================
-- HELPER: increment_charity_raised RPC function
-- Run this to support the Stripe webhook charity increment
-- =====================================================

CREATE OR REPLACE FUNCTION public.increment_charity_raised(charity_id uuid, amount numeric)
RETURNS void AS $$
  UPDATE public.charities
  SET
    total_raised = total_raised + amount,
    donor_count = donor_count + 1
  WHERE id = charity_id;
$$ LANGUAGE sql SECURITY DEFINER;
