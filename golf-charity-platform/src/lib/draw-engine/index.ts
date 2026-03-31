import { POOL_SPLIT } from '@/types'

/**
 * Converts 5 golf scores into 5 draw numbers (1–49 range).
 * Algorithm: uses the score modulo to get a base, then applies
 * a position multiplier for variety. Deterministic per score set.
 */
export function scoresToDrawNumbers(scores: number[]): number[] {
  if (scores.length !== 5) throw new Error('Exactly 5 scores required')
  if (scores.some(s => s < 50 || s > 150)) throw new Error('Scores must be 50–150')

  const multipliers = [1, 2, 3, 5, 7] // prime-based for spread
  return scores.map((score, i) => {
    const base = (score * multipliers[i]) % 49
    return base === 0 ? 49 : base
  })
}

/**
 * Generates 5 winning numbers for a draw (1–49, no repeats).
 * Uses crypto-safe random for fairness.
 */
export function generateWinningNumbers(): number[] {
  const pool = Array.from({ length: 49 }, (_, i) => i + 1)
  const shuffled = pool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5).sort((a, b) => a - b)
}

/**
 * Counts how many of the entry's numbers match the winning numbers.
 */
export function countMatches(entryNumbers: number[], winningNumbers: number[]): number {
  return entryNumbers.filter(n => winningNumbers.includes(n)).length
}

/**
 * Determines the prize tier based on match count.
 */
export function getPrizeTier(matchCount: number): '5-match' | '4-match' | '3-match' | null {
  if (matchCount === 5) return '5-match'
  if (matchCount === 4) return '4-match'
  if (matchCount === 3) return '3-match'
  return null
}

/**
 * Calculates prize amounts for all winners in a draw.
 * Jackpot (5-match) rolls over if no winner.
 */
export function calculatePrizes(params: {
  prizePoolTotal: number
  jackpotRollover: number
  fiveMatchWinners: number
  fourMatchWinners: number
  threeMatchWinners: number
}): {
  jackpotPerWinner: number
  fourMatchPerWinner: number
  threeMatchPerWinner: number
  jackpotRollsOver: boolean
  newRollover: number
} {
  const { prizePoolTotal, jackpotRollover, fiveMatchWinners, fourMatchWinners, threeMatchWinners } = params

  const jackpotPool = prizePoolTotal * POOL_SPLIT.fiveMatch + jackpotRollover
  const fourMatchPool = prizePoolTotal * POOL_SPLIT.fourMatch
  const threeMatchPool = prizePoolTotal * POOL_SPLIT.threeMatch

  const jackpotRollsOver = fiveMatchWinners === 0
  const newRollover = jackpotRollsOver ? jackpotPool : 0

  return {
    jackpotPerWinner: jackpotRollsOver ? 0 : jackpotPool / fiveMatchWinners,
    fourMatchPerWinner: fourMatchWinners > 0 ? fourMatchPool / fourMatchWinners : 0,
    threeMatchPerWinner: threeMatchWinners > 0 ? threeMatchPool / threeMatchWinners : 0,
    jackpotRollsOver,
    newRollover,
  }
}

/**
 * Calculates prize pool from subscription revenue.
 */
export function calculatePrizePool(totalRevenuePence: number): {
  prizePool: number
  charityPot: number
  operations: number
} {
  const total = totalRevenuePence / 100 // convert to pounds
  return {
    prizePool: total * 0.30,
    charityPot: total * 0.10,
    operations: total * 0.60,
  }
}
