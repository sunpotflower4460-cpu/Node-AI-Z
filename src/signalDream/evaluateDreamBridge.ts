import type { ContrastRecord } from '../signalContrast/signalContrastTypes'
import type { SignalSequenceRecord } from '../signalSequence/signalSequenceTypes'
import type { SignalPlasticityRecord } from '../signalPlasticity/signalPlasticityTypes'
import { computeEffectiveSignalWeight } from '../signalPlasticity/computeEffectiveSignalWeight'
import type { DreamBridgeEvaluation, DreamCandidate } from './signalDreamTypes'

export function evaluateDreamBridge(input: {
  candidate: DreamCandidate
  contrastRecords: ContrastRecord[]
  sequenceRecords: SignalSequenceRecord[]
  plasticityRecords: SignalPlasticityRecord[]
}): DreamBridgeEvaluation {
  const notes: string[] = []
  const contrastSupport = input.contrastRecords.find(
    contrast =>
      contrast.sourceAssemblyId === input.candidate.sourceAssemblyId &&
      contrast.targetAssemblyId === input.candidate.targetAssemblyId,
  )
  const sequenceSupport = input.sequenceRecords.find(
    sequence =>
      sequence.assemblyIds.at(-1) === input.candidate.sourceAssemblyId &&
      sequence.transitionWeights[input.candidate.targetAssemblyId] !== undefined,
  )
  const plasticitySupport = input.plasticityRecords.find(
    record =>
      record.targetType === 'bridge' &&
      record.targetId === `${input.candidate.sourceAssemblyId}->${input.candidate.targetAssemblyId}`,
  )

  const contrastScore = contrastSupport?.confidence ?? 0
  const sequenceScore = sequenceSupport?.predictionConfidence ?? 0
  const plasticityScore = plasticitySupport ? computeEffectiveSignalWeight(plasticitySupport.weights) : 0
  const confidence = Math.max(
    0,
    Math.min(
      1,
      input.candidate.supportScore * 0.45 + contrastScore * 0.25 + sequenceScore * 0.2 + plasticityScore * 0.1,
    ),
  )

  if (contrastScore > 0.55) {
    notes.push('contrast_support')
  }
  if (sequenceScore > 0.45) {
    notes.push('sequence_support')
  }
  if (plasticityScore > 0.4) {
    notes.push('plasticity_support')
  }

  return {
    candidateId: input.candidate.id,
    accepted: confidence >= 0.58,
    confidence,
    notes,
  }
}
