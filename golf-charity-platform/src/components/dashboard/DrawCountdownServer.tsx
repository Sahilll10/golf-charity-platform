'use client'

import { useEffect, useState } from 'react'
import { getTimeUntilDraw } from '@/lib/utils'

export default function DrawCountdownServer() {
  const [time, setTime] = useState(getTimeUntilDraw())

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeUntilDraw()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div>
      <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Time until draw closes</p>
      <div className="flex gap-3">
        {[
          { value: time.days, label: 'Days' },
          { value: time.hours, label: 'Hours' },
          { value: time.minutes, label: 'Minutes' },
          { value: time.seconds, label: 'Seconds' },
        ].map(({ value, label }, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="bg-surface-700 rounded-xl border border-white/6 w-16 h-16 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-bold text-white tabular-nums leading-none">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-white/25 text-[10px] uppercase tracking-wider mt-0.5">{label}</span>
            </div>
            {i < 3 && <span className="text-brand-500/40 font-bold text-lg">:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
