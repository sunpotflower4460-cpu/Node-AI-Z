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

export function generateInternalQuestions(
  targets: ActiveAttentionTarget[],
): InternalQuestion[] {
  return targets.map(target => ({
    id: `question_${target.id}`,
    questionType:
      target.reason === 'teacher_dependency_high'
        ? 'teacher_dependency'
        : target.reason === 'contrast_unclear'
          ? 'contrast'
          : target.reason === 'sequence_prediction_mismatch'
            ? 'sequence'
            : target.reason === 'high_promotion_readiness'
              ? 'promotion'
              : 'stability',
    targetId: target.targetId,
    prompt: QUESTION_PROMPTS[target.reason],
    priority: target.urgency,
    suggestedAction: normalizeSuggestedAction(target.recommendedAction),
  }))
}
