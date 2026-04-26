import type {
  SignalPersonalBranch,
  SignalBridgeRecord,
} from './signalBranchTypes'
import type { CrossModalBridge } from '../signalField/signalFieldTypes'

export type BridgeCreationContext = {
  createdBy: 'binding_teacher' | 'self_discovered'
  confidence: number
  timestamp: number
}

/**
 * Record bridge formation in the personal branch.
 *
 * Distinguishes between:
 * - Teacher-created bridges: initially dependent on binding teacher
 * - Self-discovered bridges: naturally emerged from co-activation
 *
 * Bridge origin is preserved for later maturity tracking.
 */
export function recordBridgeExperience(
  branch: SignalPersonalBranch,
  bridges: CrossModalBridge[],
  context: BridgeCreationContext,
): SignalPersonalBranch {
  const now = context.timestamp
  const updatedRecords: SignalBridgeRecord[] = [...branch.bridgeRecords]

  for (const bridge of bridges) {
    const existingIdx = updatedRecords.findIndex(
      r =>
        r.sourceAssemblyId === bridge.sourceAssemblyId &&
        r.targetAssemblyId === bridge.targetAssemblyId,
    )

    if (existingIdx >= 0) {
      // Update existing bridge
      const existing = updatedRecords[existingIdx]!
      const newTeacherCount =
        context.createdBy === 'binding_teacher'
          ? existing.teacherConfirmCount + 1
          : existing.teacherConfirmCount
      const newSelfCount =
        context.createdBy === 'self_discovered'
          ? existing.selfRecallSuccessCount + 1
          : existing.selfRecallSuccessCount

      updatedRecords[existingIdx] = {
        ...existing,
        teacherConfirmCount: newTeacherCount,
        selfRecallSuccessCount: newSelfCount,
        confidence: Math.max(existing.confidence, context.confidence),
        lastUsedAt: now,
      }
    } else {
      // Create new bridge record
      const newRecord: SignalBridgeRecord = {
        id: `bridge_${bridge.id}_${now}`,
        sourceAssemblyId: bridge.sourceAssemblyId,
        targetAssemblyId: bridge.targetAssemblyId,
        stage: 'tentative',
        createdBy: context.createdBy,
        teacherConfirmCount: context.createdBy === 'binding_teacher' ? 1 : 0,
        selfRecallSuccessCount: context.createdBy === 'self_discovered' ? 1 : 0,
        failedRecallCount: 0,
        confidence: context.confidence,
        teacherDependencyScore: context.createdBy === 'binding_teacher' ? 1.0 : 0.0,
        recallSuccessScore: context.createdBy === 'self_discovered' ? 1.0 : 0.0,
        lastUsedAt: now,
      }
      updatedRecords.push(newRecord)
    }
  }

  return {
    ...branch,
    bridgeRecords: updatedRecords,
    updatedAt: now,
  }
}

/**
 * Record a failed bridge recall attempt.
 * Increases failedRecallCount and affects maturity scores.
 */
export function recordBridgeFailure(
  branch: SignalPersonalBranch,
  sourceAssemblyId: string,
  targetAssemblyId: string,
  timestamp: number,
): SignalPersonalBranch {
  const updatedRecords = branch.bridgeRecords.map(record => {
    if (
      record.sourceAssemblyId === sourceAssemblyId &&
      record.targetAssemblyId === targetAssemblyId
    ) {
      return {
        ...record,
        failedRecallCount: record.failedRecallCount + 1,
        lastUsedAt: timestamp,
      }
    }
    return record
  })

  return {
    ...branch,
    bridgeRecords: updatedRecords,
    updatedAt: timestamp,
  }
}
