import type { SameObjectBindingCandidate } from '../signalTeacher/signalTeacherTypes'
import type { CrossModalRecallCue } from './crossModalRecallTypes'

export function createCrossModalRecallCue(
  sourcePacketId: string,
  sourceModality: string,
  candidates: SameObjectBindingCandidate[],
): CrossModalRecallCue {
  const now = Date.now()
  const id = `cue_${now}_${Math.random().toString(36).slice(2, 8)}`

  const matchingCandidates = candidates.filter(c => c.packetIds.includes(sourcePacketId))
  const targetModalitiesSet = new Set<string>()
  for (const c of matchingCandidates) {
    for (const m of c.modalities) {
      if (m !== sourceModality) targetModalitiesSet.add(m)
    }
  }

  return {
    id,
    sourcePacketId,
    sourceModality,
    targetModalities: Array.from(targetModalitiesSet),
    candidateIds: matchingCandidates.map(c => c.id),
    createdAt: now,
  }
}
