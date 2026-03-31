-- =====================================================
-- GOLF CHARITY PLATFORM — COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================
-- PROFILES (extends auth.users)
-- =====================================================
create table public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  full_name    text,
  email        text,
  avatar_url   text,
  role         text not null default 'subscriber' check (role in ('subscriber', 'admin')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- CHARITIES
-- =====================================================
create table public.charities (
  id           uuid default gen_random_uuid() primary key,
  name         text not null,
  description  text,
  logo_url     text,
  website      text,
  category     text,
  is_active    boolean default true,
  total_raised numeric(12,2) default 0,
  donor_count  int default 0,
  created_at   timestamptz default now()
);

-- Seed some charities
insert into public.charities (name, description, category, logo_url, total_raised, donor_count) values
  ('Cancer Research UK', 'World''s largest independent cancer research organisation, conducting research to prevent, diagnose and treat cancer.', 'Health', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=100&h=100&fit=crop', 48230.00, 312),
  ('British Red Cross', 'Helping people in crisis, whoever and wherever they are. Providing emergency response and health support across the UK.', 'Humanitarian', 'https://images.unsplash.com/photo-1584467735867-4297ae2ebcee?w=100&h=100&fit=crop', 31450.00, 198),
  ('RSPCA', 'Preventing cruelty and promoting kindness to animals. Rescuing, rehabilitating and rehoming animals across England and Wales.', 'Animals', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=100&h=100&fit=crop', 22870.00, 145),
  ('Age UK', 'The UK''s leading charity working with and for older people, providing services and support to help them love later life.', 'Elderly', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop', 19340.00, 122),
  ('Mental Health Foundation', 'Committed to good mental health for all through research, policy, and public mental health education.', 'Mental Health', 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=100&h=100&fit=crop', 27680.00, 176);

-- =====================================================
-- SUBSCRIPTIONS
-- =====================================================
create table public.subscriptions (
  id                      uuid default gen_random_uuid() primary key,
  user_id                 uuid references public.profiles(id) on delete cascade not null,
  stripe_customer_id      text,
  stripe_subscription_id  text unique,
  plan                    text check (plan in ('monthly', 'yearly')),
  status                  text not null default 'inactive' check (status in ('active', 'inactive', 'cancelled', 'lapsed', 'past_due')),
  charity_id              uuid references public.charities(id),
  renewal_date            timestamptz,
  amount_pence            int,
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);

-- =====================================================
-- GOLF SCORES (5-score rolling)
-- =====================================================
create table public.scores (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.profiles(id) on delete cascade not null,
  score_1      int check (score_1 between 50 and 150),
  score_2      int check (score_2 between 50 and 150),
  score_3      int check (score_3 between 50 and 150),
  score_4      int check (score_4 between 50 and 150),
  score_5      int check (score_5 between 50 and 150),
  draw_numbers int[],
  draw_month   text not null, -- 'YYYY-MM'
  submitted_at timestamptz default now(),
  updated_at   timestamptz default now(),
  unique(user_id, draw_month)
);

-- =====================================================
-- DRAWS
-- =====================================================
create table public.draws (
  id               uuid default gen_random_uuid() primary key,
  draw_month       text unique not null, -- 'YYYY-MM'
  winning_numbers  int[],
  status           text not null default 'upcoming' check (status in ('upcoming', 'open', 'processing', 'completed')),
  prize_pool_total numeric(12,2) default 0,
  jackpot_pool     numeric(12,2) default 0,    -- 40%
  four_match_pool  numeric(12,2) default 0,    -- 35%
  three_match_pool numeric(12,2) default 0,    -- 25%
  jackpot_rollover numeric(12,2) default 0,    -- carried from previous
  total_entries    int default 0,
  draw_date        timestamptz,
  created_at       timestamptz default now()
);

-- =====================================================
-- DRAW ENTRIES
-- =====================================================
create table public.draw_entries (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references public.profiles(id) not null,
  draw_id      uuid references public.draws(id) not null,
  score_id     uuid references public.scores(id),
  numbers      int[] not null,
  match_count  int default 0,
  prize_tier   text check (prize_tier in ('5-match', '4-match', '3-match')),
  prize_amount numeric(12,2) default 0,
  is_winner    boolean default false,
  created_at   timestamptz default now(),
  unique(user_id, draw_id)
);

-- =====================================================
-- WINNER VERIFICATIONS
-- =====================================================
create table public.winner_verifications (
  id             uuid default gen_random_uuid() primary key,
  user_id        uuid references public.profiles(id) not null,
  draw_id        uuid references public.draws(id) not null,
  draw_entry_id  uuid references public.draw_entries(id) not null,
  proof_url      text,
  status         text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  prize_amount   numeric(12,2),
  admin_notes    text,
  submitted_at   timestamptz default now(),
  reviewed_at    timestamptz,
  reviewed_by    uuid references public.profiles(id)
);

-- =====================================================
-- PRIZE POOL LEDGER
-- =====================================================
create table public.prize_pool_ledger (
  id                uuid default gen_random_uuid() primary key,
  draw_month        text not null,
  source            text, -- 'subscription', 'rollover'
  amount            numeric(12,2),
  subscription_id   uuid references public.subscriptions(id),
  created_at        timestamptz default now()
);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scores enable row level security;
alter table public.draws enable row level security;
alter table public.draw_entries enable row level security;
alter table public.winner_verifications enable row level security;
alter table public.charities enable row level security;
alter table public.prize_pool_ledger enable row level security;

-- Helper: is user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Profiles
create policy "users_read_own_profile" on public.profiles for select using (auth.uid() = id);
create policy "users_update_own_profile" on public.profiles for update using (auth.uid() = id);
create policy "admins_all_profiles" on public.profiles for all using (public.is_admin());

-- Subscriptions
create policy "users_read_own_sub" on public.subscriptions for select using (auth.uid() = user_id);
create policy "users_update_own_sub" on public.subscriptions for update using (auth.uid() = user_id);
create policy "service_role_manage_subs" on public.subscriptions for all using (true); -- service role bypasses
create policy "admins_all_subs" on public.subscriptions for all using (public.is_admin());

-- Scores
create policy "users_manage_own_scores" on public.scores for all using (auth.uid() = user_id);
create policy "admins_all_scores" on public.scores for all using (public.is_admin());

-- Draws (everyone can read)
create policy "anyone_read_draws" on public.draws for select using (true);
create policy "admins_manage_draws" on public.draws for all using (public.is_admin());

-- Draw entries
create policy "users_read_own_entries" on public.draw_entries for select using (auth.uid() = user_id);
create policy "users_insert_own_entries" on public.draw_entries for insert with check (auth.uid() = user_id);
create policy "admins_all_entries" on public.draw_entries for all using (public.is_admin());

-- Winner verifications
create policy "users_read_own_verif" on public.winner_verifications for select using (auth.uid() = user_id);
create policy "users_insert_own_verif" on public.winner_verifications for insert with check (auth.uid() = user_id);
create policy "admins_all_verif" on public.winner_verifications for all using (public.is_admin());

-- Charities (public read)
create policy "anyone_read_charities" on public.charities for select using (true);
create policy "admins_manage_charities" on public.charities for all using (public.is_admin());

-- Prize pool (admins only)
create policy "admins_all_pool" on public.prize_pool_ledger for all using (public.is_admin());

-- =====================================================
-- SEED: Create upcoming draw for current month
-- =====================================================
insert into public.draws (draw_month, status, draw_date, prize_pool_total, jackpot_pool, four_match_pool, three_match_pool)
values (
  to_char(now(), 'YYYY-MM'),
  'open',
  date_trunc('month', now()) + interval '1 month' - interval '1 day',
  0, 0, 0, 0
) on conflict (draw_month) do nothing;

-- =====================================================
-- STORAGE BUCKET for winner proofs
-- =====================================================
-- Run separately in Supabase Storage:
-- Create bucket named "winner-proofs" (private)
-- Create bucket named "charity-logos" (public)
