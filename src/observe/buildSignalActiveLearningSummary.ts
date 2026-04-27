import type { ActiveAttentionSummary } from '../signalAttentionActive/activeAttentionTypes'
import type { ContrastSummary } from '../signalContrast/signalContrastTypes'
import type { SequenceSummary } from '../signalSequence/signalSequenceTypes'
import type { PlasticitySummary } from '../signalPlasticity/signalPlasticityTypes'
import type { DreamSummary } from '../signalDream/signalDreamTypes'
import type { InternalQuestionSummary } from '../signalInquiry/signalInquiryTypes'

export type SignalActiveLearningSummary = {
  activeAttention: ActiveAttentionSummary
  contrast: ContrastSummary
  sequence: SequenceSummary
  plasticity: PlasticitySummary
  dream: DreamSummary
  inquiry: InternalQuestionSummary
}

export function buildSignalActiveLearningSummary(input: SignalActiveLearningSummary): SignalActiveLearningSummary {
  return input
}
