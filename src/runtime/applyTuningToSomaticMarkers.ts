import type { SomaticMarker, SomaticSignature } from '../intelligence/somatic/types'
import { somaticOutcomeFromTuningAction, updateSomaticMarkers } from '../intelligence/somatic'
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
