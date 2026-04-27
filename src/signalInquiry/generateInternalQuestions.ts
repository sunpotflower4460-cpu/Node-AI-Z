import type { ActiveAttentionTarget } from '../signalAttentionActive/activeAttentionTypes'
import type { InternalQuestion } from './signalInquiryTypes'

const QUESTION_PROMPTS: Record<ActiveAttentionTarget['reason'], string> = {
  unstable_but_repeating: 'Why does this pattern repeat without stabilizing?',
  teacher_dependency_high: 'Can this bridge survive with less teacher support?',
  recall_failed: 'What is missing when recall fails here?',
  high_promotion_readiness: 'Is this pattern ready to strengthen into a stable seed?',
  sequence_prediction_mismatch: 'Why did the next activation differ from prediction?',
  contrast_unclear: 'What feature separates these similar patterns?',
}

function normalizeSuggestedAction(
  action: ActiveAttentionTarget['recommendedAction'],
): InternalQuestion['suggestedAction'] {
  return action === 'suppress' ? 'observe_next_turn' : action
}

function mapQuestionType(
  reason: ActiveAttentionTarget['reason'],
): InternalQuestion['questionType'] {
  switch (reason) {
    case 'teacher_dependency_high':
      return 'teacher_dependency'
    case 'contrast_unclear':
      return 'contrast'
    case 'sequence_prediction_mismatch':
      return 'sequence'
    case 'high_promotion_readiness':
      return 'promotion'
    default:
      return 'stability'
  }
}

export function generateInternalQuestions(
  targets: ActiveAttentionTarget[],
): InternalQuestion[] {
  return targets.map(target => ({
    id: `question_${target.id}`,
    questionType: mapQuestionType(target.reason),
    targetId: target.targetId,
    prompt: QUESTION_PROMPTS[target.reason],
    priority: target.urgency,
    suggestedAction: normalizeSuggestedAction(target.recommendedAction),
  }))
}
