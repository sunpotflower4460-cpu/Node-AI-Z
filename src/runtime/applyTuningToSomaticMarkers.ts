import type { SomaticMarker, SomaticSignature } from '../somatic/types'
import { somaticOutcomeFromTuningAction, updateSomaticMarkers } from '../somatic'
import type { UserTuningAction } from '../revision/types'

export const applyTuningToSomaticMarkers = (
  markers: SomaticMarker[],
  signature: SomaticSignature,
  decisionShape: SomaticMarker['decisionShape'],
  tuningAction: UserTuningAction,
  timestamp: number,
): SomaticMarker[] => {
  const outcome = somaticOutcomeFromTuningAction(tuningAction)
  return updateSomaticMarkers(markers, signature, decisionShape, outcome, timestamp)
}
