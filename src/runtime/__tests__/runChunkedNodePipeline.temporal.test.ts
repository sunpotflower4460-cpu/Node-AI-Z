import { describe, it, expect } from 'vitest'
import { runChunkedNodePipeline } from '../runChunkedNodePipeline'

const INPUT_TEXT = '意欲が湧かなくて、転職すべきか悩んでいる'

describe('runChunkedNodePipeline temporal integration (ISR v2.2)', () => {
  it('returns chunkedStage with all v2.2 stage fields', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    const stage = result.chunkedStage
    expect(stage.decayedFeatures).toBeDefined()
    expect(stage.refractoryFeatures).toBeDefined()
    expect(stage.recurrentResult).toBeDefined()
    expect(stage.lateralInhibitedFeatures).toBeDefined()
  })

  it('recurrentResult has iterations and converged', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    const { recurrentResult } = result.chunkedStage
    expect(typeof recurrentResult.iterations).toBe('number')
    expect(typeof recurrentResult.converged).toBe('boolean')
  })

  it('recurrentResult iterations >= 1', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    expect(result.chunkedStage.recurrentResult.iterations).toBeGreaterThanOrEqual(1)
  })

  it('debugNotes contain temporal decay info', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    const notes = result.debugNotes.join(' ')
    expect(notes).toMatch(/[Tt]emporal decay|Temporal decay: no features/)
  })

  it('debugNotes contain refractory info', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    const notes = result.debugNotes.join(' ')
    expect(notes).toMatch(/[Rr]efractory/)
  })

  it('debugNotes contain recurrent self loop info', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    const notes = result.debugNotes.join(' ')
    expect(notes).toMatch(/[Rr]ecurrent self loop/)
  })

  it('debugNotes contain lateral inhibition info', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    const notes = result.debugNotes.join(' ')
    expect(notes).toMatch(/[Ll]ateral inhibition/)
  })

  it('debugNotes contain dynamic threshold info', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    const notes = result.debugNotes.join(' ')
    expect(notes).toMatch(/[Dd]ynamic threshold/)
  })

  it('pathwayKeys includes threshold adaptive key', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    expect(result.pathwayKeys).toBeDefined()
    expect(result.pathwayKeys!.some((k) => k.startsWith('threshold:adaptive='))).toBe(true)
  })

  it('pathwayKeys includes loop key', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    expect(result.pathwayKeys!.some((k) => k.startsWith('loop:self_reaction'))).toBe(true)
  })

  it('activates at least one node', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    expect(result.activatedNodes.length).toBeGreaterThanOrEqual(1)
  })

  it('full pipeline shape is valid (bind / pattern / field)', () => {
    const result = runChunkedNodePipeline(INPUT_TEXT)
    expect(Array.isArray(result.activatedNodes)).toBe(true)
    expect(Array.isArray(result.suppressedNodes)).toBe(true)
    expect(Array.isArray(result.bindings)).toBe(true)
    expect(Array.isArray(result.liftedPatterns)).toBe(true)
    expect(result.stateVector).toBeDefined()
    expect(result.meta).toBeDefined()
  })

  it('falls back to processing node for unrecognised input', () => {
    const result = runChunkedNodePipeline('abcxyz')
    expect(result.activatedNodes.some((n) => n.id === 'processing')).toBe(true)
  })

  it('afterglowStrength biases initial features slightly upward', () => {
    const noGlow = runChunkedNodePipeline(INPUT_TEXT, undefined, 0.5, 0, undefined, undefined, 0)
    const withGlow = runChunkedNodePipeline(INPUT_TEXT, undefined, 0.5, 0, undefined, undefined, 0.1)
    // With afterglow the raw feature strengths should be slightly higher
    const rawNoGlow = noGlow.chunkedStage.rawFeatures.reduce((s, f) => s + f.strength, 0)
    const rawWithGlow = withGlow.chunkedStage.rawFeatures.reduce((s, f) => s + f.strength, 0)
    expect(rawWithGlow).toBeGreaterThanOrEqual(rawNoGlow)
  })

  it('previousTemporalStates triggers decay on second turn', () => {
    const turn0Result = runChunkedNodePipeline(INPUT_TEXT, undefined, 0.5, 0)
    // Build a previous state map from turn 0 output
    const prevMap = new Map(
      turn0Result.chunkedStage.decayedFeatures.map((f) => [
        f.id,
        {
          id: f.id,
          strength: f.strength,
          lastFiredTurn: 0,
          decayRate: f.decayRate ?? 0.1,
          refractoryUntilTurn: f.refractoryUntilTurn ?? -1,
        },
      ]),
    )
    const turn5Result = runChunkedNodePipeline(INPUT_TEXT, undefined, 0.5, 5, prevMap)
    const decayNotes = turn5Result.debugNotes.filter((n) => n.includes('Temporal decay:') && n.includes('→'))
    // At least one feature should show decay from turn 0 → turn 5
    expect(decayNotes.length).toBeGreaterThan(0)
  })
})
