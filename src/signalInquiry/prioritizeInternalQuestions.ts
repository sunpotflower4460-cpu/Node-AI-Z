import type { InternalQuestion } from './signalInquiryTypes'

export function prioritizeInternalQuestions(
  questions: InternalQuestion[],
  boundaryTension: number,
  predictionResidue: number,
): InternalQuestion[] {
  const modulation = 1 + boundaryTension * 0.25 + predictionResidue * 0.25

  return [...questions]
    .map(question => ({
      ...question,
      priority: Math.min(1, question.priority * modulation),
    }))
    .sort((a, b) => b.priority - a.priority)
}
