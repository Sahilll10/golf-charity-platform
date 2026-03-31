import { cn } from '@/lib/utils'

interface DrawBallProps {
  number: number
  variant?: 'default' | 'winning' | 'match' | 'small'
  animate?: boolean
}

export default function DrawBall({ number, variant = 'default', animate = false }: DrawBallProps) {
  const base = 'inline-flex items-center justify-center rounded-full font-display font-bold tabular-nums border transition-all'

  const variants = {
    default: 'w-11 h-11 text-base text-brand-400 border-brand-500/30 bg-brand-500/8',
    winning: 'w-11 h-11 text-base text-white border-brand-500 bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_0_16px_rgba(34,197,94,0.4)]',
    match:   'w-11 h-11 text-base text-white border-gold-500 bg-gradient-to-br from-gold-500 to-gold-700 shadow-[0_0_16px_rgba(245,158,11,0.4)]',
    small:   'w-7 h-7 text-xs text-brand-400 border-brand-500/25 bg-brand-500/8',
  }

  return (
    <span className={cn(base, variants[variant], animate && 'animate-float')}>
      {number}
    </span>
  )
}

interface DrawBallRowProps {
  numbers: number[]
  winningNumbers?: number[]
  size?: 'default' | 'small'
}

export function DrawBallRow({ numbers, winningNumbers = [], size = 'default' }: DrawBallRowProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {numbers.map((n) => {
        const isWinning = winningNumbers.length > 0 && winningNumbers.includes(n)
        return (
          <DrawBall
            key={n}
            number={n}
            variant={isWinning ? 'match' : size === 'small' ? 'small' : 'default'}
          />
        )
      })}
    </div>
  )
}
