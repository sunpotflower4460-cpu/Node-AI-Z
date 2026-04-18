import { describe, expect, it } from 'vitest'
import { computePredictionError } from '../computePredictionError'
import type { CuePredictionState } from '../buildPredictionState'
import type { MicroCue } from '../packetTypes'

const makeCue = (id: string, strength: number): MicroCue => ({ id, strength, reasons: [] })

describe('computePredictionError', () => {
  it('detects missing and unexpected cues with error magnitudes', () => {
    const predicted: CuePredictionState = {
      expectedCueIds: ['hope_cue'],
      expectedStrengths: { hope_cue: 0.6 },
      confidence: 0.8,
      turn: 1,
    }
    const actual = [makeCue('pressure_cue', 0.5)]

    const summary = computePredictionError(predicted, actual)

    expect(summary.missingCues).toContain('hope_cue')
    expect(summary.surpriseCues).toContain('pressure_cue')
    expect(summary.overallError).toBeGreaterThan(0)
  })

  it('returns zero error when no prior confidence', () => {
    const summary = computePredictionError(
      { expectedCueIds: [], expectedStrengths: {}, confidence: 0, turn: 0 },
      [makeCue('motivation_drop', 0.4)],
    )
    expect(summary.overallError).toBe(0)
    expect(summary.errors).toHaveLength(0)
  })
})
