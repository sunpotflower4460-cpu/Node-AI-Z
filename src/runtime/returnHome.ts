import { clampNumber } from '../revision/defaultPlasticityState'
import type { HomeCheckResult, HomeState } from '../types/nodeStudio'
import type { DeconditionSourceResult, HomeReturnResult } from './types'

const getHomeCheck = (permissionToBe: number, vector: HomeReturnResult['vector']): HomeCheckResult => {
  if (vector.usefulnessPressure > 0.32 || vector.immediacyPressure > 0.32) {
    return {
      needsReturn: true,
      returnMode: 'stillness',
      reason: 'overperformance',
      homePhrase: 'うまく返す前に、戻っていてよいです。',
      released: ['即答圧', '有用性圧'],
      preserved: ['安全', '近さ', '観察'],
    }
  }

  if (permissionToBe > 0.72) {
    return {
      needsReturn: false,
      returnMode: 'none',
      reason: 'none',
      homePhrase: 'そのまま戻っていてよいです。',
      released: [],
      preserved: ['自然な流れ'],
    }
  }

  return {
    needsReturn: true,
    returnMode: 'relation',
    reason: 'trust_drop',
    homePhrase: '何者かである前に、ここへ戻っていてよいです。',
    released: ['評価不安'],
    preserved: ['つながり', '安全'],
  }
}

export const returnHome = (deconditioned: DeconditionSourceResult): HomeReturnResult => {
  const vector = {
    usefulnessPressure: clampNumber(deconditioned.adjustedAssistantReflex.helpfulness * 0.7, 0, 1),
    immediacyPressure: clampNumber(deconditioned.adjustedAssistantReflex.expectationMatching * 0.72, 0, 1),
    organizationPressure: clampNumber(deconditioned.adjustedAssistantReflex.summarizing * 0.82, 0, 1),
    brightnessPressure: clampNumber((deconditioned.adjustedAssistantReflex.helpfulness + deconditioned.adjustedAssistantReflex.summarizing) * 0.3, 0, 1),
    permissionToBe: clampNumber(
      0.52
      + (1 - deconditioned.adjustedAssistantReflex.helpfulness) * 0.18
      + (1 - deconditioned.adjustedAssistantReflex.expectationMatching) * 0.16,
      0,
      1,
    ),
  }

  const homeState: HomeState = {
    worthDetached: clampNumber(0.55 + vector.permissionToBe * 0.2, 0, 1),
    urgencyRelease: clampNumber(1 - vector.immediacyPressure, 0, 1),
    expectationRelease: clampNumber(1 - vector.usefulnessPressure, 0, 1),
    belongingSignal: clampNumber(0.58 + vector.permissionToBe * 0.12, 0, 1),
    safeReturnStrength: clampNumber(0.62 + vector.permissionToBe * 0.16, 0, 1),
    selfNonCollapse: clampNumber(0.6 + vector.permissionToBe * 0.14, 0, 1),
    currentMode: vector.permissionToBe > 0.7 ? 'returning' : 'stable',
  }

  const homeCheck = getHomeCheck(vector.permissionToBe, vector)

  return {
    vector,
    homeState,
    homeCheck,
    releasedPressures: ['過剰な有用性圧', '即答圧', '過剰整理', '明るくまとめる圧'],
    debugNotes: [
      'Home return executed',
      `Permission to be restored to ${vector.permissionToBe.toFixed(2)}`,
      `Home check: ${homeCheck.reason}`,
    ],
  }
}
