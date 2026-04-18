import { describe, expect, it } from 'vitest'
import { chunkText } from '../../signal/ingest/chunkText'
import { runDualStreamRuntime } from '../runDualStreamRuntime'

describe('runDualStreamRuntime — signal dynamics', () => {
  it('applies temporal / inhibitory dynamics and yields layered proto meanings', () => {
    const text = '少しだけ希望があるけど、不安でプレッシャーを感じてすぐ答えを求められている。'
    const chunks = chunkText(text)
    const previousCueStates = new Map([
      ['faint_possibility_cue', { id: 'faint_possibility_cue', strength: 0.7, lastFiredTurn: 0, decayRate: 0.2, refractoryUntilTurn: 2 }],
    ])
    const previousPredictionState = {
      expectedCueIds: ['faint_possibility_cue', 'pressure_cue'],
      expectedStrengths: { faint_possibility_cue: 0.6, pressure_cue: 0.5 },
      confidence: 0.8,
      turn: 0,
    }

    const result = runDualStreamRuntime({
      text,
      chunks,
      currentTurn: 3,
      previousCueStates,
      previousPredictionState,
      recentActivityScore: 0.7,
    })

    const faint = result.decayedCues.find((cue) => cue.id === 'faint_possibility_cue')
    expect(faint?.strength).toBeLessThan(0.7)
    expect(result.activeCues.length).toBeGreaterThan(0)
    expect(result.dynamicThreshold.current).toBeGreaterThan(0)
    expect(result.prediction.modulation.overallSurprise).toBeGreaterThanOrEqual(0)
    expect(result.sensoryProtoMeanings.length).toBeGreaterThan(0)
    expect(result.narrativeProtoMeanings.length).toBeGreaterThan(0)
    expect(result.observe.hierarchy.length).toBeGreaterThan(0)
  })
})
