import { describe, expect, it } from 'vitest'
import { applyCueInhibition } from '../applyCueInhibition'
import type { MicroCue } from '../packetTypes'

const makeCue = (id: string, strength: number): MicroCue => ({
  id,
  strength,
  reasons: [],
})

describe('applyCueInhibition', () => {
  it('applies inhibition from faint_possibility_cue to uncertainty-like cues', () => {
    const cues = [
      makeCue('faint_possibility_cue', 0.6),
      makeCue('uncertainty_cue', 0.6),
    ]
    const { cues: out } = applyCueInhibition(cues)
    const uncertainty = out.find((cue) => cue.id === 'uncertainty_cue')!
    expect(uncertainty.strength).toBeLessThan(0.6)
  })

  it('applies inhibition from pressure_cue to faint_possibility_cue', () => {
    const cues = [
      makeCue('pressure_cue', 0.7),
      makeCue('faint_possibility_cue', 0.5),
    ]
    const { cues: out } = applyCueInhibition(cues)
    const hope = out.find((cue) => cue.id === 'faint_possibility_cue')!
    expect(hope.strength).toBeLessThan(0.5)
  })

  it('returns debug notes even when no inhibition fired', () => {
    const cues = [makeCue('motivation_drop', 0.4)]
    const { debugNotes } = applyCueInhibition(cues)
    expect(debugNotes.length).toBeGreaterThan(0)
  })
})
