import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('winner_verifications')
    .select('*, profile:profiles(full_name, email), draw:draws(draw_month, winning_numbers), draw_entry:draw_entries(numbers, prize_tier)')
    .order('submitted_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') {
    query = query.eq('user_id', user.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ verifications: data })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, status, payment_status, admin_notes } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const updates: Record<string, any> = {}
  if (status) { updates.status = status; updates.reviewed_at = new Date().toISOString(); updates.reviewed_by = user.id }
  if (payment_status) updates.payment_status = payment_status
  if (admin_notes !== undefined) updates.admin_notes = admin_notes

  const { error } = await supabase.from('winner_verifications').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
