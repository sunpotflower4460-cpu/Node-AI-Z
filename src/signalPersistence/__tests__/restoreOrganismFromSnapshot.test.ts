import { describe, expect, it } from 'vitest'
import { createSignalSnapshot } from '../createSignalSnapshot'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import { createInitialSignalLoopState } from '../../signalLoop/createInitialSignalLoopState'
import { createInitialOrganismState } from '../../signalOrganism/createInitialOrganismState'
import { createInitialBackgroundLoopState } from '../../signalBackground/createInitialBackgroundLoopState'
import { extendSignalSnapshotWithOrganism } from '../extendSignalSnapshotWithOrganism'
import { restoreOrganismFromSnapshot } from '../restoreOrganismFromSnapshot'

const EMPTY_FIELD_STATE = {
  particles: [],
  links: [],
  recentActivations: [],
  assemblies: [],
  protoMeanings: [],
  crossModalBridges: [],
  frameCount: 0,
}

describe('restoreOrganismFromSnapshot', () => {
  it('restores organism state from a snapshot that has one', () => {
    const snap = createSignalSnapshot({
      fieldState: EMPTY_FIELD_STATE,
      personalBranch: createInitialSignalPersonalBranch(),
      loopState: createInitialSignalLoopState(),
    })
    const organism = createInitialOrganismState()
    const background = createInitialBackgroundLoopState()
    const extended = extendSignalSnapshotWithOrganism(snap, organism, background)

    const restored = restoreOrganismFromSnapshot(extended)
    expect(restored.warnings).toHaveLength(0)
    expect((restored.organismState as typeof organism).organismId).toBe(organism.organismId)
  })

  it('returns initial state when snapshot has no organism state', () => {
    const snap = createSignalSnapshot({
      fieldState: EMPTY_FIELD_STATE,
      personalBranch: createInitialSignalPersonalBranch(),
      loopState: createInitialSignalLoopState(),
    })
    const restored = restoreOrganismFromSnapshot(snap)
    expect(restored.organismState).toBeDefined()
    expect(restored.backgroundLoopState).toBeDefined()
  })

  it('handles broken organism state gracefully', () => {
    const snap = createSignalSnapshot({
      fieldState: EMPTY_FIELD_STATE,
      personalBranch: createInitialSignalPersonalBranch(),
      loopState: createInitialSignalLoopState(),
    })
    const broken = { ...snap, organismState: { invalid: true } }
    const restored = restoreOrganismFromSnapshot(broken)
    expect(restored.warnings.length).toBeGreaterThan(0)
    expect(restored.organismState).toBeDefined()
  })

  it('handles old snapshot version without organism state', () => {
    const snap = {
      ...createSignalSnapshot({
        fieldState: EMPTY_FIELD_STATE,
        personalBranch: createInitialSignalPersonalBranch(),
        loopState: createInitialSignalLoopState(),
      }),
      version: 1,
      organismState: undefined,
    }
    const restored = restoreOrganismFromSnapshot(snap)
    expect(restored.warnings.some(w => w.includes('version'))).toBe(true)
    expect(restored.organismState).toBeDefined()
  })
})
