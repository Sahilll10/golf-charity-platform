export type Role = 'subscriber' | 'admin'
export type SubStatus = 'active' | 'inactive' | 'cancelled' | 'lapsed' | 'past_due'
export type DrawStatus = 'upcoming' | 'open' | 'processing' | 'completed'
export type VerifStatus = 'pending' | 'approved' | 'rejected'
export type PaymentStatus = 'pending' | 'paid'
export type PrizeTier = '5-match' | '4-match' | '3-match'
export type Plan = 'monthly' | 'yearly'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  role: Role
  created_at: string
  updated_at: string
}

export interface Charity {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  category: string | null
  is_active: boolean
  total_raised: number
  donor_count: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: Plan | null
  status: SubStatus
  charity_id: string | null
  renewal_date: string | null
  amount_pence: number | null
  created_at: string
  updated_at: string
  charity?: Charity
}

export interface Score {
  id: string
  user_id: string
  score_1: number | null
  score_2: number | null
  score_3: number | null
  score_4: number | null
  score_5: number | null
  draw_numbers: number[] | null
  draw_month: string
  submitted_at: string
  updated_at: string
}

export interface Draw {
  id: string
  draw_month: string
  winning_numbers: number[] | null
  status: DrawStatus
  prize_pool_total: number
  jackpot_pool: number
  four_match_pool: number
  three_match_pool: number
  jackpot_rollover: number
  total_entries: number
  draw_date: string | null
  created_at: string
}

export interface DrawEntry {
  id: string
  user_id: string
  draw_id: string
  score_id: string | null
  numbers: number[]
  match_count: number
  prize_tier: PrizeTier | null
  prize_amount: number
  is_winner: boolean
  created_at: string
  draw?: Draw
  profile?: Profile
}

export interface WinnerVerification {
  id: string
  user_id: string
  draw_id: string
  draw_entry_id: string
  proof_url: string | null
  status: VerifStatus
  payment_status: PaymentStatus
  prize_amount: number | null
  admin_notes: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  profile?: Profile
  draw?: Draw
  draw_entry?: DrawEntry
}

export interface DashboardStats {
  totalWon: number
  drawsEntered: number
  currentStreak: number
  charityContributed: number
}

export interface AdminStats {
  totalSubscribers: number
  activeSubscribers: number
  totalRevenue: number
  totalCharityRaised: number
  pendingWinners: number
  currentPrizePool: number
}

export const PRIZE_POOL_PERCENT = 0.30
export const CHARITY_PERCENT = 0.10
export const POOL_SPLIT = {
  fiveMatch: 0.40,
  fourMatch: 0.35,
  threeMatch: 0.25,
}

export const PLANS = {
  monthly: {
    name: 'Monthly',
    price: 1999,
    interval: 'month' as const,
    description: 'Perfect for getting started',
    features: ['Monthly prize draw entry', 'Score tracking', 'Charity contribution', 'Winner dashboard'],
  },
  yearly: {
    name: 'Yearly',
    price: 19999,
    interval: 'year' as const,
    description: '2 months free — best value',
    features: ['All monthly features', '2 months free', 'Priority winner processing', 'Exclusive yearly stats'],
    savings: '£3.99/mo saved',
  },
}
