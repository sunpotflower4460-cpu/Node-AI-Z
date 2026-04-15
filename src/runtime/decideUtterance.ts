import { clampNumber } from '../revision/defaultPlasticityState'
import type { MeaningRiseResult, RelationalField, SelfDecision } from './types'

export const decideUtterance = (
  field: RelationalField,
  meaningRise: MeaningRiseResult,
  questionSignal: number,
): SelfDecision => {
  const shouldStayOpen = field.stayWithNotKnowing > 0.58 || meaningRise.unknowns.length > 0
  const shouldAnswerQuestion = questionSignal > 0.5 && field.answerPressure > 0.32 && !shouldStayOpen

  const withheldBias = [...meaningRise.withheld]
  if (field.fragility > 0.62) {
    withheldBias.push('false_brightness')
  }
  if (field.ambiguity > 0.62) {
    withheldBias.push('premature_certainty')
  }
  if (field.urgency > 0.55) {
    withheldBias.push('assistant_performance')
  }

  let replyIntent = 'stay_with'
  if (shouldAnswerQuestion) replyIntent = 'answer_from_stance'
  else if (field.fragility > 0.68) replyIntent = 'protect_before_answer'
  else if (shouldStayOpen) replyIntent = 'hold_open'

  let stance = 'quiet_closeness'
  if (shouldStayOpen) stance = 'stay_open'
  else if (shouldAnswerQuestion) stance = 'truth_without_force'
  else if (field.fragility > 0.68) stance = 'protective_nearness'

  const answerDepth =
    shouldAnswerQuestion
      ? (field.gravity > 0.64 || field.fragility > 0.66 ? 'light' : 'medium')
      : (field.closeness > 0.68 && !shouldStayOpen ? 'medium' : 'light')

  return {
    replyIntent,
    stance,
    closeness: clampNumber(field.closeness + (field.fragility > 0.7 ? 0.04 : 0), 0, 1),
    answerDepth,
    withheldBias: Array.from(new Set(withheldBias)),
    shouldAnswerQuestion,
    shouldStayOpen,
    debugNotes: [
      'Self decision started',
      `Reply intent: ${replyIntent}`,
      `Stance: ${stance}`,
      `Should stay open: ${shouldStayOpen ? 'yes' : 'no'}`,
    ],
  }
}
