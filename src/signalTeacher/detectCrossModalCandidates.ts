import type { SensoryPacket } from '../signalSensory/sensoryPacketTypes'
import type { SameObjectBindingCandidate } from './signalTeacherTypes'
import { createBindingCandidate } from './createBindingCandidate'

export function detectCrossModalCandidates(
  packets: SensoryPacket[],
  assemblyIds: string[],
  options?: { maxAgeMs?: number },
): SameObjectBindingCandidate[] {
  const maxAgeMs = options?.maxAgeMs ?? 10000
  const candidates: SameObjectBindingCandidate[] = []

  for (let i = 0; i < packets.length; i++) {
    for (let j = i + 1; j < packets.length; j++) {
      const a = packets[i]!
      const b = packets[j]!
      if (a.modality === b.modality) continue
      const timeDiff = Math.abs(a.createdAt - b.createdAt)
      if (timeDiff > maxAgeMs) continue
      candidates.push(createBindingCandidate([a, b], assemblyIds, 'temporal_cooccurrence'))
    }
  }

  return candidates
}
