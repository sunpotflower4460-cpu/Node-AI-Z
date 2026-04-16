import type { ProtoMeaning, SignalDecision, UtteranceMode } from './types'

const ALL_MODES: UtteranceMode[] = ['receptive', 'reflective', 'boundary', 'resonant']

export const decideSignalUtterance = (
  protoMeanings: ProtoMeaning[],
  boundaryTension: number,
  resonanceScore: number,
): SignalDecision => {
  const trace: string[] = []

  const dominantTextures = protoMeanings.slice(0, 2).map((pm) => pm.texture)
  const avgValence = protoMeanings.length > 0
    ? protoMeanings.reduce((sum, pm) => sum + pm.valence, 0) / protoMeanings.length
    : 0

  trace.push(`Proto-meanings: ${protoMeanings.map((pm) => pm.texture).join(', ')}`)
  trace.push(`Boundary tension: ${boundaryTension.toFixed(2)}, resonance: ${resonanceScore.toFixed(2)}, avg valence: ${avgValence.toFixed(2)}`)

  let utteranceMode: UtteranceMode = 'receptive'

  // Boundary mode: high tension and closed/conflicted texture
  if (boundaryTension > 0.6 && (dominantTextures.includes('closed') || dominantTextures.includes('conflicted'))) {
    utteranceMode = 'boundary'
    trace.push('Decision: boundary (high tension + closed/conflicted)')
  }
  // Resonant mode: high resonance, hopeful or open texture
  else if (resonanceScore > 0.65 && (dominantTextures.includes('hopeful') || dominantTextures.includes('open'))) {
    utteranceMode = 'resonant'
    trace.push('Decision: resonant (high resonance + positive texture)')
  }
  // Reflective mode: ambiguous or searching texture
  else if (dominantTextures.includes('ambiguous') || dominantTextures.includes('searching') || dominantTextures.includes('still')) {
    utteranceMode = 'reflective'
    trace.push('Decision: reflective (ambiguous/searching/still texture)')
  }
  // Default receptive: heavy, fragile, or low resonance
  else {
    utteranceMode = 'receptive'
    trace.push('Decision: receptive (default)')
  }

  const suppressedModes = ALL_MODES.filter((m) => m !== utteranceMode)
  trace.push(`Suppressed modes: ${suppressedModes.join(', ')}`)

  return {
    shouldSpeak: true,
    utteranceMode,
    suppressedModes,
    decisionTrace: trace,
  }
}
