import type { SensoryPacket } from '../signalSensory/sensoryPacketTypes'
import type { SameObjectBindingCandidate, BindingCandidateSource } from './signalTeacherTypes'

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const len = Math.min(a.length, b.length)
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < len; i++) {
    dot += a[i]! * b[i]!
    normA += a[i]! * a[i]!
    normB += b[i]! * b[i]!
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : Math.max(0, Math.min(1, dot / denom))
}

export function createBindingCandidate(
  packets: SensoryPacket[],
  assemblyIds: string[],
  source: BindingCandidateSource,
): SameObjectBindingCandidate {
  const now = Date.now()
  const id = `binding_${now}_${Math.random().toString(36).slice(2, 8)}`

  let featureSimilarityScore = 0
  if (packets.length >= 2) {
    let total = 0, count = 0
    for (let i = 0; i < packets.length; i++) {
      for (let j = i + 1; j < packets.length; j++) {
        total += cosineSimilarity(packets[i]!.features.values, packets[j]!.features.values)
        count++
      }
    }
    featureSimilarityScore = count > 0 ? total / count : 0
  }

  let temporalProximityScore = 0
  if (packets.length >= 2) {
    const timestamps = packets.map(p => p.createdAt)
    const maxGap = Math.max(...timestamps) - Math.min(...timestamps)
    temporalProximityScore = maxGap <= 5000 ? 1 - maxGap / 5000 : 0
  }

  const coActivationScore = assemblyIds.length > 0 ? Math.min(1, assemblyIds.length / 5) : 0
  const overallBindingScore = (featureSimilarityScore + temporalProximityScore + coActivationScore) / 3

  return {
    id,
    createdAt: now,
    updatedAt: now,
    status: 'candidate',
    source,
    packetIds: packets.map(p => p.id),
    modalities: packets.map(p => p.modality).filter(
      (m): m is SameObjectBindingCandidate['modalities'][number] =>
        ['text', 'image', 'audio', 'synthetic_text', 'synthetic_image', 'synthetic_audio'].includes(m)
    ),
    assemblyIds,
    score: {
      coActivationScore,
      featureSimilarityScore,
      temporalProximityScore,
      overallBindingScore,
    },
    teacher: {
      teacherChecked: false,
      teacherDependencyScore: 0.8,
      teacherConfirmCount: 0,
      teacherRejectCount: 0,
    },
    recall: {
      recallAttemptCount: 0,
      recallSuccessCount: 0,
      recallFailureCount: 0,
    },
    risk: {
      falseBindingRisk: 0.3,
      overbindingRisk: 0.2,
      uncertainty: 0.6,
    },
    notes: [],
  }
}
