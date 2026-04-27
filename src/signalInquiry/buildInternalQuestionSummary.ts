import type { InternalQuestion, InternalQuestionSummary } from './signalInquiryTypes'

export function buildInternalQuestionSummary(
  questions: InternalQuestion[],
): InternalQuestionSummary {
  return {
    totalQuestions: questions.length,
    topQuestions: questions.slice(0, 5),
  }
}
