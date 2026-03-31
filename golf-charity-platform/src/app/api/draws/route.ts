import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .order('draw_month', { ascending: false })
    .limit(12)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ draws: data })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { draw_month, draw_date } = await req.json()
  if (!draw_month) return NextResponse.json({ error: 'draw_month required' }, { status: 400 })

  const { data, error } = await supabase.from('draws').insert({
    draw_month,
    draw_date,
    status: 'upcoming',
    prize_pool_total: 0,
    jackpot_pool: 0,
    four_match_pool: 0,
    three_match_pool: 0,
    jackpot_rollover: 0,
    total_entries: 0,
  }).select().single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Draw already exists for this month' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ draw: data })
}
