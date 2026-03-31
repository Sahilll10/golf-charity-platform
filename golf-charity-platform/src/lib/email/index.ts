// Email notifications via Resend
// https://resend.com - free tier: 100 emails/day

const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM = 'GolfDraw <noreply@golfdraw.co.uk>'

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.log('RESEND_API_KEY not set — skipping email:', subject)
    return
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })
    if (!res.ok) console.error('Email send failed:', await res.text())
  } catch (err) {
    console.error('Email error:', err)
  }
}

export async function sendWinnerEmail(params: {
  to: string
  name: string
  drawMonth: string
  prizeTier: string
  prizeAmount: number
}) {
  const { to, name, drawMonth, prizeTier, prizeAmount } = params
  const pounds = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(prizeAmount)

  await sendEmail(
    to,
    `🏆 You won the ${drawMonth} draw — ${pounds}`,
    `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#080c08;color:#fff;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#052e16,#0f150f);padding:40px;text-align:center">
        <h1 style="color:#22c55e;font-size:28px;margin:0 0 8px">You won! 🎉</h1>
        <p style="color:rgba(255,255,255,0.5);margin:0">${drawMonth} Monthly Draw</p>
      </div>
      <div style="padding:32px">
        <p style="color:rgba(255,255,255,0.8)">Hi ${name},</p>
        <p style="color:rgba(255,255,255,0.6)">
          Congratulations! Your numbers matched in the ${drawMonth} draw.
          You've won a <strong style="color:#f59e0b">${prizeTier}</strong> prize of
          <strong style="color:#22c55e;font-size:20px"> ${pounds}</strong>.
        </p>
        <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:12px;padding:20px;margin:24px 0;text-align:center">
          <p style="color:rgba(255,255,255,0.4);margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em">Your prize</p>
          <p style="color:#22c55e;font-size:36px;font-weight:700;margin:0">${pounds}</p>
        </div>
        <p style="color:rgba(255,255,255,0.6)">
          To claim your prize, log in to your dashboard and upload a screenshot of your golf scores as proof. Our team will review within 48 hours.
        </p>
        <div style="text-align:center;margin:32px 0">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings"
             style="background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">
            Claim your prize →
          </a>
        </div>
        <p style="color:rgba(255,255,255,0.3);font-size:12px">
          This email was sent to ${to} because you have an active GolfDraw subscription.
        </p>
      </div>
    </div>
    `
  )
}

export async function sendWelcomeEmail(params: {
  to: string
  name: string
  plan: string
}) {
  const { to, name, plan } = params
  await sendEmail(
    to,
    'Welcome to GolfDraw — you\'re in! 🏌️',
    `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#080c08;color:#fff;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#052e16,#0f150f);padding:40px;text-align:center">
        <h1 style="color:#22c55e;font-size:28px;margin:0 0 8px">Welcome to GolfDraw</h1>
        <p style="color:rgba(255,255,255,0.5);margin:0">${plan} plan activated</p>
      </div>
      <div style="padding:32px">
        <p style="color:rgba(255,255,255,0.8)">Hi ${name},</p>
        <p style="color:rgba(255,255,255,0.6)">Your subscription is now active. Here's what to do next:</p>
        <div style="space-y:12px">
          ${[
            ['❤️', 'Choose your charity', 'Pick the cause that receives your monthly contribution'],
            ['⛳', 'Enter your 5 golf scores', 'Get your unique draw numbers for this month'],
            ['🏆', 'Win the monthly draw', 'Match 3, 4 or all 5 numbers to win a cash prize'],
          ].map(([icon, title, desc]) => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:16px;margin-bottom:10px">
              <div style="display:flex;align-items:center;gap:12px">
                <span style="font-size:22px">${icon}</span>
                <div>
                  <p style="color:#fff;font-weight:600;margin:0 0 2px">${title}</p>
                  <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0">${desc}</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="text-align:center;margin:32px 0">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">
            Go to your dashboard →
          </a>
        </div>
      </div>
    </div>
    `
  )
}

export async function sendVerificationResultEmail(params: {
  to: string
  name: string
  status: 'approved' | 'rejected'
  prizeAmount: number
  adminNotes?: string
}) {
  const { to, name, status, prizeAmount, adminNotes } = params
  const pounds = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(prizeAmount)
  const approved = status === 'approved'

  await sendEmail(
    to,
    approved ? `✅ Prize claim approved — ${pounds} incoming` : '❌ Prize claim — action required',
    `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#080c08;color:#fff;border-radius:16px;overflow:hidden">
      <div style="background:${approved ? 'linear-gradient(135deg,#052e16,#0f150f)' : 'linear-gradient(135deg,#1a0a0a,#0f150f)'};padding:40px;text-align:center">
        <h1 style="color:${approved ? '#22c55e' : '#f87171'};font-size:24px;margin:0">
          ${approved ? '✅ Claim Approved!' : '❌ Claim Rejected'}
        </h1>
      </div>
      <div style="padding:32px">
        <p style="color:rgba(255,255,255,0.8)">Hi ${name},</p>
        ${approved
          ? `<p style="color:rgba(255,255,255,0.6)">Your prize claim of <strong style="color:#22c55e">${pounds}</strong> has been approved. Payment will be processed within 5 business days.</p>`
          : `<p style="color:rgba(255,255,255,0.6)">Unfortunately your prize claim was not approved this time.</p>`
        }
        ${adminNotes ? `<div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:14px;margin-top:16px"><p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0"><strong>Note from our team:</strong> ${adminNotes}</p></div>` : ''}
        <div style="text-align:center;margin:28px 0">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings"
             style="background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.3);padding:12px 28px;border-radius:10px;text-decoration:none;display:inline-block">
            View in dashboard
          </a>
        </div>
      </div>
    </div>
    `
  )
}
