import type { DreamExplorationResult, DreamSummary } from './signalDreamTypes'

export function buildDreamSummary(result: DreamExplorationResult): DreamSummary {
  return {
    candidateCount: result.candidates.length,
    acceptedCount: result.evaluations.filter(evaluation => evaluation.accepted).length,
    strengthenedBridgeIds: result.strengthenedBridgeIds,
    createdBridgeIds: result.createdBridgeIds,
    notes: result.notes,
  }
}
