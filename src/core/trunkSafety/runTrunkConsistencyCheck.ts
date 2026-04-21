import type { SharedTrunkState } from '../coreTypes'
import type { TrunkConsistencyResult } from './trunkSafetyTypes'

const checkNumericMap = (
  label: string,
  values: Record<string, number>,
  notes: string[],
  warningKeys: string[],
) => {
  for (const [key, value] of Object.entries(values)) {
    if (!Number.isFinite(value) || Math.abs(value) > 1) {
      notes.push(`${label} ${key} is outside the safe range`)
      warningKeys.push(`${label}:${key}`)
    }
  }
}

export const runTrunkConsistencyCheck = (trunk: SharedTrunkState): TrunkConsistencyResult => {
  const notes: string[] = []
  const warningKeys: string[] = []

  const patternKeys = trunk.schemaPatterns.map((pattern) => pattern.key)
  const duplicatePatternKeys = patternKeys.filter((key, index) => patternKeys.indexOf(key) !== index)
  if (duplicatePatternKeys.length > 0) {
    notes.push(`Duplicate schema pattern keys: ${Array.from(new Set(duplicatePatternKeys)).join(', ')}`)
    warningKeys.push('schemaPatterns:duplicates')
  }

  if (trunk.schemaPatterns.length === 0) {
    notes.push('Shared trunk schemaPatterns is empty after the current operation')
  }

  checkNumericMap('conceptualBiases', trunk.conceptualBiases, notes, warningKeys)
  checkNumericMap('protoMeaningBias', trunk.protoMeaningBias, notes, warningKeys)
  checkNumericMap('optionDetectionBias', trunk.optionDetectionBias, notes, warningKeys)

  const appliedCandidateIds = new Set(
    (trunk.promotionQueue ?? [])
      .filter((entry) => entry.status === 'applied')
      .map((entry) => entry.candidate.id)
  )

  const appliedWithoutLedger = Array.from(appliedCandidateIds).filter(
    (candidateId) => !(trunk.trunkApplyRecords ?? []).some((record) => record.candidateId === candidateId)
  )

  if (appliedWithoutLedger.length > 0) {
    notes.push(`Applied promotion queue entries are missing trunk apply records: ${appliedWithoutLedger.join(', ')}`)
    warningKeys.push('promotionQueue:missingApplyRecord')
  }

  return {
    ok: warningKeys.length === 0,
    notes,
    warningKeys,
  }
}
