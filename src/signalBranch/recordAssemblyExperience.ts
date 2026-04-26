import type {
  SignalPersonalBranch,
  SignalAssemblyRecord,
  SignalExperienceSource,
} from './signalBranchTypes'
import type { Assembly } from '../signalField/signalFieldTypes'

/**
 * Record assembly detection in the personal branch.
 *
 * - If assembly already exists, increment recurrenceCount
 * - If replay-sourced, increment replayCount
 * - Update stabilityScore based on recurrence
 * - Track source in sourceHistory
 *
 * IMPORTANT: Assemblies are NOT semantic meanings yet.
 * They are "stable firing groups" that recur across stimuli.
 */
export function recordAssemblyExperience(
  branch: SignalPersonalBranch,
  detectedAssemblies: Assembly[],
  source: SignalExperienceSource,
): SignalPersonalBranch {
  const now = Date.now()
  const updatedRecords: SignalAssemblyRecord[] = [...branch.assemblyRecords]

  for (const assembly of detectedAssemblies) {
    const existingIdx = updatedRecords.findIndex(r => r.assemblyId === assembly.id)

    if (existingIdx >= 0) {
      // Update existing record
      const existing = updatedRecords[existingIdx]!
      const newRecurrence = existing.recurrenceCount + 1
      const newReplay = source === 'internal_replay' ? existing.replayCount + 1 : existing.replayCount
      const newStability = Math.min(1.0, existing.stabilityScore + 0.05 * Math.log(newRecurrence + 1))

      updatedRecords[existingIdx] = {
        ...existing,
        recurrenceCount: newRecurrence,
        replayCount: newReplay,
        lastActivatedAt: now,
        stabilityScore: newStability,
        sourceHistory: [...existing.sourceHistory.slice(-9), source], // Keep last 10 sources
      }
    } else {
      // Create new record
      const newRecord: SignalAssemblyRecord = {
        id: `record_${assembly.id}_${now}`,
        assemblyId: assembly.id,
        particleIds: assembly.particleIds,
        recurrenceCount: 1,
        replayCount: source === 'internal_replay' ? 1 : 0,
        lastActivatedAt: now,
        stabilityScore: 0.1,
        sourceHistory: [source],
      }
      updatedRecords.push(newRecord)
    }
  }

  // Prune very old stale records (not activated in last 1000 turns, recurrence < 3)
  const pruned = updatedRecords.filter(
    r => r.recurrenceCount >= 3 || now - r.lastActivatedAt < 1_000_000,
  )

  return {
    ...branch,
    assemblyRecords: pruned,
    updatedAt: now,
  }
}
