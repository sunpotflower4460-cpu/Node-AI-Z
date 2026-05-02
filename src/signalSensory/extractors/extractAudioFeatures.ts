import type { SensoryFeatureVector } from '../sensoryPacketTypes'
import { SENSORY_FEATURE_DIM } from '../sensoryPacketTypes'
import { createAudioMockFeatures } from './createAudioMockFeatures'

/**
 * Extract low-level structural features from a Web Audio API AudioBuffer.
 *
 * Features (8 dimensions):
 *  [0] amplitudeMean    — mean absolute amplitude across all samples (0-1)
 *  [1] amplitudeMax     — maximum amplitude across all samples (0-1)
 *  [2] amplitudeVariance — variance of amplitude (0-1)
 *  [3] zeroCrossRate    — zero-crossing rate normalized to [0,1]
 *  [4] energyLow        — relative energy in lower third of samples
 *  [5] energyMid        — relative energy in middle third of samples
 *  [6] energyHigh       — relative energy in upper third of samples
 *  [7] rhythmScore      — regularity estimate (0 = irregular, 1 = perfectly regular)
 *
 * Falls back to a mock feature set if AudioBuffer is null/undefined.
 * No semantic meaning is assigned — only waveform structure.
 */
export function extractAudioFeatures(
  buffer: AudioBuffer | null | undefined,
): SensoryFeatureVector {
  if (!buffer || buffer.length === 0) {
    return createAudioMockFeatures()
  }

  // Mix down to mono for analysis
  const channelData = buffer.getChannelData(0)
  const sampleCount = channelData.length

  // --- amplitude stats ---
  let sumAbs = 0
  let maxAbs = 0
  for (let i = 0; i < sampleCount; i++) {
    const abs = Math.abs(channelData[i]!)
    sumAbs += abs
    if (abs > maxAbs) maxAbs = abs
  }
  const amplitudeMean = Math.min(1, sumAbs / sampleCount)
  const amplitudeMax = Math.min(1, maxAbs)

  // variance
  let varSum = 0
  for (let i = 0; i < sampleCount; i++) {
    const diff = Math.abs(channelData[i]!) - amplitudeMean
    varSum += diff * diff
  }
  const amplitudeVariance = Math.min(1, (varSum / sampleCount) * 4)

  // --- zero crossing rate ---
  let crossings = 0
  for (let i = 1; i < sampleCount; i++) {
    if ((channelData[i - 1]! >= 0) !== (channelData[i]! >= 0)) crossings++
  }
  const zeroCrossRate = Math.min(1, crossings / Math.max(sampleCount - 1, 1))

  // --- energy bands (temporal thirds) ---
  const third = Math.floor(sampleCount / 3)
  let energyLow = 0
  let energyMid = 0
  let energyHigh = 0
  for (let i = 0; i < sampleCount; i++) {
    const e = channelData[i]! * channelData[i]!
    if (i < third) energyLow += e
    else if (i < 2 * third) energyMid += e
    else energyHigh += e
  }
  const totalEnergy = energyLow + energyMid + energyHigh + 1e-9
  energyLow = Math.min(1, (energyLow / totalEnergy) * 3)
  energyMid = Math.min(1, (energyMid / totalEnergy) * 3)
  energyHigh = Math.min(1, (energyHigh / totalEnergy) * 3)

  // --- rhythm score: autocorrelation at a fixed temporal lag ---
  // LAG_DIVISOR = 20: at 44.1 kHz this captures ~50ms patterns (typical beat resolution)
  const LAG_DIVISOR = 20
  const LAG = Math.max(1, Math.floor(sampleCount / LAG_DIVISOR))
  let autoCorr = 0
  for (let i = 0; i + LAG < sampleCount; i++) {
    autoCorr += channelData[i]! * channelData[i + LAG]!
  }
  const rhythmScore = Math.min(1, Math.max(0, autoCorr / (sampleCount * 0.5 + 1)))

  return {
    values: [
      amplitudeMean,
      amplitudeMax,
      amplitudeVariance,
      zeroCrossRate,
      energyLow,
      energyMid,
      energyHigh,
      rhythmScore,
    ],
    dimension: SENSORY_FEATURE_DIM,
    normalized: true,
    featureNames: AUDIO_FEATURE_NAMES,
  }
}

export const AUDIO_FEATURE_NAMES: string[] = [
  'amplitudeMean',
  'amplitudeMax',
  'amplitudeVariance',
  'zeroCrossRate',
  'energyLow',
  'energyMid',
  'energyHigh',
  'rhythmScore',
]
