import type { MicroCue } from './packetTypes'

export type CuePredictionState = {
  expectedCueIds: string[]
  expectedStrengths: Record<string, number>
  confidence: number
  turn: number
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))

/**
 * Build a light-weight prior over which cues are expected to stay active next turn.
 * Top cues become expectations with slightly softened strengths.
 */
export const buildPredictionState = (cues: MicroCue[], turn: number): CuePredictionState => {
  const sorted = [...cues].sort((a, b) => b.strength - a.strength)
  const expected = sorted.filter((cue) => cue.strength >= 0.22).slice(0, 6)

  const expectedCueIds = expected.map((cue) => cue.id)
  const expectedStrengths = expected.reduce<Record<string, number>>((acc, cue) => {
    acc[cue.id] = clamp(cue.strength * 0.9)
    return acc
  }, {})

  const confidence =
    expected.length > 0
      ? clamp(
          expected.reduce((sum, cue) => sum + cue.strength, 0) / expected.length,
        )
      : 0

  return {
    expectedCueIds,
    expectedStrengths,
    confidence,
    turn,
  }
}
