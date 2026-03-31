import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scoresToDrawNumbers } from '@/lib/draw-engine'
import { getDrawMonth } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Verify active subscription
    const { data: sub } = await supabase
      .from('subscriptions').select('status').eq('user_id', user.id).single()
    if (sub?.status !== 'active') {
      return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
    }

    const { scores } = await req.json()
    if (!Array.isArray(scores) || scores.length !== 5) {
      return NextResponse.json({ error: 'Exactly 5 scores required' }, { status: 400 })
    }
    if (scores.some((s: number) => s < 50 || s > 150)) {
      return NextResponse.json({ error: 'Scores must be between 50 and 150' }, { status: 400 })
    }

    const drawMonth = getDrawMonth()
    const drawNumbers = scoresToDrawNumbers(scores)

    const payload = {
      user_id: user.id,
      score_1: scores[0], score_2: scores[1], score_3: scores[2],
      score_4: scores[3], score_5: scores[4],
      draw_numbers: drawNumbers,
      draw_month: drawMonth,
      updated_at: new Date().toISOString(),
    }

    const { data: existing } = await supabase
      .from('scores').select('id').eq('user_id', user.id).eq('draw_month', drawMonth).maybeSingle()

    const { error } = existing
      ? await supabase.from('scores').update(payload).eq('id', existing.id)
      : await supabase.from('scores').insert(payload)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Upsert draw entry
    const { data: draw } = await supabase
      .from('draws').select('id').eq('draw_month', drawMonth).maybeSingle()

    if (draw) {
      await supabase.from('draw_entries').upsert({
        user_id: user.id,
        draw_id: draw.id,
        numbers: drawNumbers,
      }, { onConflict: 'user_id,draw_id' })
    }

    return NextResponse.json({ success: true, drawNumbers })
  } catch (err) {
    console.error('Scores API error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const drawMonth = getDrawMonth()
  const { data } = await supabase
    .from('scores').select('*').eq('user_id', user.id).eq('draw_month', drawMonth).maybeSingle()

  return NextResponse.json({ score: data })
}
