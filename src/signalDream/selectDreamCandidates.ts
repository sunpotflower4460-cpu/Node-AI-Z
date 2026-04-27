import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { ContrastRecord } from '../signalContrast/signalContrastTypes'
import type { SignalSequenceRecord } from '../signalSequence/signalSequenceTypes'
import type { DreamCandidate } from './signalDreamTypes'

export function selectDreamCandidates(input: {
  branch: SignalPersonalBranch
  contrastRecords: ContrastRecord[]
  sequenceRecords: SignalSequenceRecord[]
}): DreamCandidate[] {
  const candidates: DreamCandidate[] = []

  for (const bridge of input.branch.bridgeRecords) {
    if (bridge.teacherDependencyScore >= 0.6) {
      candidates.push({
        id: `dream_bridge_${bridge.id}`,
        sourceAssemblyId: bridge.sourceAssemblyId,
        targetAssemblyId: bridge.targetAssemblyId,
        origin: 'teacher_dependency_bridge',
        supportScore: Math.max(0.45, bridge.confidence * 0.5 + (1 - bridge.teacherDependencyScore) * 0.5),
      })
    }
  }

  for (const contrast of input.contrastRecords) {
    if (
      (contrast.relation === 'same_category' || contrast.relation === 'similar_but_different') &&
      !input.branch.bridgeRecords.some(
        bridge =>
          bridge.sourceAssemblyId === contrast.sourceAssemblyId &&
          bridge.targetAssemblyId === contrast.targetAssemblyId,
      )
    ) {
      candidates.push({
        id: `dream_contrast_${contrast.id}`,
        sourceAssemblyId: contrast.sourceAssemblyId,
        targetAssemblyId: contrast.targetAssemblyId,
        origin: 'contrast_gap',
        supportScore: contrast.confidence,
      })
    }
  }

  for (const sequence of input.sequenceRecords) {
    if (sequence.assemblyIds.length === 0) {
      continue
    }

    const sourceAssemblyId = sequence.assemblyIds.at(-1)!
    const sortedTransitions = Object.entries(sequence.transitionWeights).sort(([, weightA], [, weightB]) => weightB - weightA)
    const topTransition = sortedTransitions[0]
    const targetAssemblyId = topTransition?.[0]
    if (!targetAssemblyId) {
      continue
    }

    candidates.push({
      id: `dream_sequence_${sequence.id}`,
      sourceAssemblyId,
      targetAssemblyId,
      origin: 'sequence_bridge',
      supportScore: sequence.predictionConfidence,
    })
  }

  return candidates
    .sort((a, b) => b.supportScore - a.supportScore)
    .slice(0, 6)
}
