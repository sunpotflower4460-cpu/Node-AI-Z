import type { MicroCue } from './packetTypes'
import type { CuePredictionState } from './buildPredictionState'

export type CuePredictionError = {
  cueId: string
  expected: number
  actual: number
  error: number
  type: 'correct' | 'unexpected_present' | 'expected_absent' | 'strength_higher' | 'strength_lower'
}

export type CuePredictionErrorSummary = {
  errors: CuePredictionError[]
  surpriseCues: string[]
  missingCues: string[]
  overallError: number
}

const ERROR_TOLERANCE = 0.08

export const computePredictionError = (
  predicted: CuePredictionState,
  actualCues: MicroCue[],
): CuePredictionErrorSummary => {
  if (predicted.confidence === 0) {
    return { errors: [], surpriseCues: [], missingCues: [], overallError: 0 }
  }

  const actualMap = new Map(actualCues.map((cue) => [cue.id, cue.strength]))
  const errors: CuePredictionError[] = []

  // Check expected cues
  for (const [cueId, expected] of Object.entries(predicted.expectedStrengths)) {
    const actual = actualMap.get(cueId) ?? 0
    const diff = actual - expected
    const magnitude = Math.abs(diff)

    const type: CuePredictionError['type'] =
      actual === 0
        ? 'expected_absent'
        : magnitude <= ERROR_TOLERANCE
          ? 'correct'
          : diff > 0
            ? 'strength_higher'
            : 'strength_lower'

    errors.push({ cueId, expected, actual, error: magnitude, type })
  }

  // Unexpected cues
  for (const cue of actualCues) {
    if (predicted.expectedCueIds.includes(cue.id)) continue
    errors.push({
      cueId: cue.id,
      expected: 0,
      actual: cue.strength,
      error: cue.strength,
      type: 'unexpected_present',
    })
  }

  const surpriseCues = errors
    .filter((err) => ['unexpected_present', 'strength_higher'].includes(err.type))
    .map((err) => err.cueId)
  const missingCues = errors.filter((err) => err.type === 'expected_absent').map((err) => err.cueId)

  const overallError =
    errors.length > 0
      ? Math.min(1, errors.reduce((sum, err) => sum + err.error, 0) / errors.length)
      : 0

  return { errors, surpriseCues, missingCues, overallError }
}
