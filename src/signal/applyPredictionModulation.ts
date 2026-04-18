import type { MicroCue } from './packetTypes'
import type { CuePredictionState } from './buildPredictionState'
import { computePredictionError } from './computePredictionError'

export type CuePredictionModulationResult = {
  cues: MicroCue[]
  overallSurprise: number
  surpriseCues: string[]
  missingCues: string[]
  errors: ReturnType<typeof computePredictionError>['errors']
  debugNotes: string[]
}

const SURPRISE_BOOST_FACTOR = 0.08
const SURPRISE_THRESHOLD = 0.15

const clamp = (value: number) => Math.max(0, Math.min(1, value))

export const applyPredictionModulation = (
  cues: MicroCue[],
  predicted: CuePredictionState,
): CuePredictionModulationResult => {
  if (predicted.confidence === 0) {
    return {
      cues,
      overallSurprise: 0,
      surpriseCues: [],
      missingCues: [],
      errors: [],
      debugNotes: ['Prediction modulation: no prior prediction — skipped'],
    }
  }

  const { errors, surpriseCues, missingCues, overallError } = computePredictionError(predicted, cues)
  const cueMap = new Map(cues.map((cue) => [cue.id, { ...cue }]))
  const debugNotes: string[] = []

  for (const err of errors) {
    if (err.type === 'correct') continue
    if (err.error < SURPRISE_THRESHOLD) continue

    const magnitude = err.error * predicted.confidence
    if (cueMap.has(err.cueId)) {
      const cue = cueMap.get(err.cueId)!
      const boost = magnitude * SURPRISE_BOOST_FACTOR
      const nextStrength = clamp(cue.strength + boost)
      cueMap.set(err.cueId, { ...cue, strength: nextStrength })
      debugNotes.push(
        `  Surprise boost: ${err.cueId} +${boost.toFixed(3)} (error=${err.error.toFixed(3)}, type=${err.type})`,
      )
    } else if (err.type === 'expected_absent') {
      debugNotes.push(
        `  Expected but absent: ${err.cueId} (expected=${err.expected.toFixed(3)})`,
      )
    }
  }

  const overallSurprise = overallError * predicted.confidence

  if (debugNotes.length === 0) {
    debugNotes.push('Prediction modulation: no significant surprise signals')
  } else {
    debugNotes.unshift(
      `Prediction modulation: ${surpriseCues.length} surprise cue(s), overallSurprise=${overallSurprise.toFixed(3)}`,
    )
  }

  return {
    cues: [...cueMap.values()],
    overallSurprise,
    surpriseCues,
    missingCues,
    errors,
    debugNotes,
  }
}
