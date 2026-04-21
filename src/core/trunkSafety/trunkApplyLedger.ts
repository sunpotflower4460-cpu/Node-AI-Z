import type { SharedTrunkState } from '../coreTypes'
import type {
  TrunkApplyRecord,
  TrunkConsistencyResult,
  TrunkRevertRecord,
  TrunkSafetyState,
  TrunkSnapshotRecord,
} from './trunkSafetyTypes'

const LEDGER_STORAGE_KEY = 'nodeaiz:trunk-safety:ledger'
const SNAPSHOT_STORAGE_KEY = 'nodeaiz:trunk-safety:snapshots'

let trunkSafetyState: TrunkSafetyState = {
  applyRecords: [],
  revertRecords: [],
  snapshotRecords: [],
  safeUndoNotes: [],
}

let trunkSnapshots: Record<string, SharedTrunkState> = {}

const cloneTrunk = (trunk: SharedTrunkState): SharedTrunkState =>
  JSON.parse(JSON.stringify(trunk)) as SharedTrunkState

const persist = () => {
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(trunkSafetyState))
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(trunkSnapshots))
  } catch (error) {
    console.warn('Failed to persist trunk safety state.', error)
  }
}

const hydrate = () => {
  if (typeof localStorage === 'undefined') return

  try {
    const storedState = localStorage.getItem(LEDGER_STORAGE_KEY)
    const storedSnapshots = localStorage.getItem(SNAPSHOT_STORAGE_KEY)
    if (storedState) {
      const parsed = JSON.parse(storedState) as Partial<TrunkSafetyState>
      trunkSafetyState = {
        applyRecords: parsed.applyRecords ?? [],
        revertRecords: parsed.revertRecords ?? [],
        snapshotRecords: parsed.snapshotRecords ?? [],
        currentRevertSafetySnapshotId: parsed.currentRevertSafetySnapshotId,
        lastTrunkConsistencyCheck: parsed.lastTrunkConsistencyCheck,
        safeUndoNotes: parsed.safeUndoNotes ?? [],
      }
    }
    if (storedSnapshots) {
      trunkSnapshots = JSON.parse(storedSnapshots) as Record<string, SharedTrunkState>
    }
  } catch (error) {
    console.warn('Failed to hydrate trunk safety state.', error)
  }
}

hydrate()

export const appendTrunkApplyRecord = (record: TrunkApplyRecord): TrunkApplyRecord => {
  trunkSafetyState.applyRecords = [...trunkSafetyState.applyRecords, record]
  persist()
  return record
}

export const listTrunkApplyRecords = (): TrunkApplyRecord[] => {
  return [...trunkSafetyState.applyRecords].sort((a, b) => b.appliedAt - a.appliedAt)
}

export const findTrunkApplyRecord = (applyRecordId: string): TrunkApplyRecord | undefined => {
  return trunkSafetyState.applyRecords.find((record) => record.id === applyRecordId)
}

export const listApplyRecordsByCandidateId = (candidateId: string): TrunkApplyRecord[] => {
  return listTrunkApplyRecords().filter((record) => record.candidateId === candidateId)
}

export const appendTrunkRevertRecord = (record: TrunkRevertRecord): TrunkRevertRecord => {
  trunkSafetyState.revertRecords = [...trunkSafetyState.revertRecords, record]
  persist()
  return record
}

export const listTrunkRevertRecords = (): TrunkRevertRecord[] => {
  return [...trunkSafetyState.revertRecords].sort((a, b) => b.revertedAt - a.revertedAt)
}

export const findTrunkRevertRecord = (revertRecordId: string): TrunkRevertRecord | undefined => {
  return trunkSafetyState.revertRecords.find((record) => record.id === revertRecordId)
}

export const findRevertRecordByApplyRecordId = (applyRecordId: string): TrunkRevertRecord | undefined => {
  return trunkSafetyState.revertRecords.find((record) => record.targetApplyRecordId === applyRecordId)
}

export const saveTrunkSnapshot = (
  trunk: SharedTrunkState,
  snapshot: Omit<TrunkSnapshotRecord, 'id' | 'createdAt' | 'trunkVersion'> & { id?: string },
): TrunkSnapshotRecord => {
  const record: TrunkSnapshotRecord = {
    id: snapshot.id ?? `trunk-snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    trunkVersion: trunk.version,
    ...snapshot,
  }

  trunkSnapshots[record.id] = cloneTrunk(trunk)
  trunkSafetyState.snapshotRecords = [...trunkSafetyState.snapshotRecords, record]
  persist()
  return record
}

export const loadTrunkSnapshot = (snapshotId: string): SharedTrunkState | undefined => {
  const snapshot = trunkSnapshots[snapshotId]
  return snapshot ? cloneTrunk(snapshot) : undefined
}

export const listTrunkSnapshotRecords = (): TrunkSnapshotRecord[] => {
  return [...trunkSafetyState.snapshotRecords].sort((a, b) => b.createdAt - a.createdAt)
}

export const findTrunkSnapshotRecord = (snapshotId: string): TrunkSnapshotRecord | undefined => {
  return trunkSafetyState.snapshotRecords.find((record) => record.id === snapshotId)
}

export const setCurrentRevertSafetySnapshotId = (snapshotId: string | undefined): void => {
  trunkSafetyState.currentRevertSafetySnapshotId = snapshotId
  persist()
}

export const getCurrentRevertSafetySnapshotId = (): string | undefined => {
  return trunkSafetyState.currentRevertSafetySnapshotId
}

export const setLastTrunkConsistencyCheck = (result: TrunkConsistencyResult | undefined): void => {
  trunkSafetyState.lastTrunkConsistencyCheck = result
  persist()
}

export const getLastTrunkConsistencyCheck = (): TrunkConsistencyResult | undefined => {
  return trunkSafetyState.lastTrunkConsistencyCheck
}

export const setSafeUndoNotes = (notes: string[]): void => {
  trunkSafetyState.safeUndoNotes = [...notes]
  persist()
}

export const getSafeUndoNotes = (): string[] => {
  return [...trunkSafetyState.safeUndoNotes]
}

export const getTrunkSafetyState = (): TrunkSafetyState => ({
  applyRecords: listTrunkApplyRecords(),
  revertRecords: listTrunkRevertRecords(),
  snapshotRecords: listTrunkSnapshotRecords(),
  currentRevertSafetySnapshotId: trunkSafetyState.currentRevertSafetySnapshotId,
  lastTrunkConsistencyCheck: trunkSafetyState.lastTrunkConsistencyCheck,
  safeUndoNotes: getSafeUndoNotes(),
})

export const restoreTrunkSafetyState = (state: Partial<TrunkSafetyState>): void => {
  trunkSafetyState = {
    applyRecords: [...(state.applyRecords ?? [])],
    revertRecords: [...(state.revertRecords ?? [])],
    snapshotRecords: [...(state.snapshotRecords ?? [])],
    currentRevertSafetySnapshotId: state.currentRevertSafetySnapshotId,
    lastTrunkConsistencyCheck: state.lastTrunkConsistencyCheck,
    safeUndoNotes: [...(state.safeUndoNotes ?? [])],
  }
  persist()
}

export const attachTrunkSafetyState = (trunk: SharedTrunkState): SharedTrunkState => {
  const safetyState = getTrunkSafetyState()
  return {
    ...trunk,
    trunkApplyRecords: safetyState.applyRecords,
    trunkRevertRecords: safetyState.revertRecords,
    trunkSnapshotRecords: safetyState.snapshotRecords,
    currentRevertSafetySnapshotId: safetyState.currentRevertSafetySnapshotId,
    lastTrunkConsistencyCheck: safetyState.lastTrunkConsistencyCheck,
    safeUndoNotes: safetyState.safeUndoNotes,
  }
}

export const clearTrunkSafetyState = (): void => {
  trunkSafetyState = {
    applyRecords: [],
    revertRecords: [],
    snapshotRecords: [],
    safeUndoNotes: [],
  }
  trunkSnapshots = {}
  persist()
}
