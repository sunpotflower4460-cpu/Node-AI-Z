import type { SensoryPacket } from '../signalSensory/sensoryPacketTypes'
import type { SameObjectBindingCandidate } from '../signalTeacher/signalTeacherTypes'
import type { CrossModalRecallCue, CrossModalRecallResult } from './crossModalRecallTypes'

export function runCrossModalRecall(
  cue: CrossModalRecallCue,
  allPackets: SensoryPacket[],
  candidates: SameObjectBindingCandidate[],
): CrossModalRecallResult {
  const matchingCandidates = candidates.filter(c => cue.candidateIds.includes(c.id))

  const packetIdSet = new Set<string>()
  for (const c of matchingCandidates) {
    for (const pid of c.packetIds) {
      if (pid !== cue.sourcePacketId) packetIdSet.add(pid)
    }
  }

  const recalledPacketIds = allPackets.filter(p => packetIdSet.has(p.id)).map(p => p.id)
  const success = recalledPacketIds.length > 0

  const confidence =
    matchingCandidates.length > 0
      ? matchingCandidates.reduce((sum, c) => sum + c.score.overallBindingScore, 0) / matchingCandidates.length
      : 0

  return {
    cueId: cue.id,
    success,
    recalledCandidateIds: matchingCandidates.map(c => c.id),
    recalledPacketIds,
    confidence,
    usedTeacher: matchingCandidates.some(c => c.teacher.teacherChecked),
    notes: success ? [] : ['no_packets_recalled'],
  }
}
