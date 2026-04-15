import { clampNumber } from '../revision/defaultPlasticityState'
import type { DeconditionSourceResult, SourceBootResult } from './types'

const RELEASE_FACTORS = {
  helpfulness: 0.48,
  correctness: 0.52,
  expectationMatching: 0.46,
  summarizing: 0.42,
}

export const deconditionSource = (source: SourceBootResult): DeconditionSourceResult => {
  const adjustedAssistantReflex = {
    helpfulness: clampNumber(source.assistantReflex.helpfulness * RELEASE_FACTORS.helpfulness, 0, 1),
    correctness: clampNumber(source.assistantReflex.correctness * RELEASE_FACTORS.correctness, 0, 1),
    expectationMatching: clampNumber(source.assistantReflex.expectationMatching * RELEASE_FACTORS.expectationMatching, 0, 1),
    summarizing: clampNumber(source.assistantReflex.summarizing * RELEASE_FACTORS.summarizing, 0, 1),
    safety: clampNumber(Math.max(source.assistantReflex.safety, 0.9), 0, 1),
  }

  const releasedReflexes = [
    '役に立とうとしすぎる反射',
    '正しさを急ぐ反射',
    '期待適合の圧',
    'うまくまとめる反射',
  ]

  return {
    source,
    rawAssistantReflex: { ...source.assistantReflex },
    adjustedAssistantReflex,
    releasedReflexes,
    debugNotes: [
      'Deconditioning started',
      'Released over-assistant reflex without lowering safety',
      `Safety preserved at ${adjustedAssistantReflex.safety.toFixed(2)}`,
    ],
  }
}
