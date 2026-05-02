import { describe, expect, it } from 'vitest'
import { createSignalSnapshot } from '../createSignalSnapshot'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'
import { createInitialSignalLoopState } from '../../signalLoop/createInitialSignalLoopState'
import { createInitialOrganismState } from '../../signalOrganism/createInitialOrganismState'
import { createInitialBackgroundLoopState } from '../../signalBackground/createInitialBackgroundLoopState'
import { extendSignalSnapshotWithOrganism } from '../extendSignalSnapshotWithOrganism'
import { SIGNAL_SNAPSHOT_VERSION } from '../signalPersistenceTypes'

const EMPTY_FIELD_STATE = {
  particles: [],
  links: [],
  recentActivations: [],
  assemblies: [],
  protoMeanings: [],
  crossModalBridges: [],
  frameCount: 0,
}

describe('extendSignalSnapshotWithOrganism', () => {
  it('adds organism and background state to snapshot', () => {
    const snap = createSignalSnapshot({
      fieldState: EMPTY_FIELD_STATE,
      personalBranch: createInitialSignalPersonalBranch(),
      loopState: createInitialSignalLoopState(),
    })
    const organism = createInitialOrganismState()
    const background = createInitialBackgroundLoopState()
    const extended = extendSignalSnapshotWithOrganism(snap, organism, background)
    expect(extended.organismState).toBeDefined()
    expect(extended.backgroundLoopState).toBeDefined()
  })

  it('does not mutate the original snapshot', () => {
    const snap = createSignalSnapshot({
      fieldState: EMPTY_FIELD_STATE,
      personalBranch: createInitialSignalPersonalBranch(),
      loopState: createInitialSignalLoopState(),
    })
    const organism = createInitialOrganismState()
    const background = createInitialBackgroundLoopState()
    extendSignalSnapshotWithOrganism(snap, organism, background)
    expect(snap.organismState).toBeUndefined()
  })

  it('snapshot version is current', () => {
    const snap = createSignalSnapshot({
      fieldState: EMPTY_FIELD_STATE,
      personalBranch: createInitialSignalPersonalBranch(),
      loopState: createInitialSignalLoopState(),
    })
    expect(snap.version).toBe(SIGNAL_SNAPSHOT_VERSION)
  })
})
