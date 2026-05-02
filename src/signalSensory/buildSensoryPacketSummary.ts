import type { SensoryPacket } from './sensoryPacketTypes'

export type SensoryPacketSummary = {
  id: string
  modality: string
  source: string
  kind: string
  featureCount: number
  meanFeatureValue: number
  topFeatureIndex: number
  topFeatureValue: number
  topFeatureName: string
  extractionConfidence: number
  isMock: boolean
  tags: string[]
  description: string
}

/**
 * Builds a compact human-readable summary of a SensoryPacket for UI display
 * and debug logging. Does not assign semantic meaning.
 */
export function buildSensoryPacketSummary(packet: SensoryPacket): SensoryPacketSummary {
  const { features, confidence, tags, rawSummary } = packet

  const values = features.values
  const featureCount = values.length
  const meanFeatureValue =
    featureCount > 0 ? values.reduce((s, v) => s + v, 0) / featureCount : 0

  let topIndex = 0
  let topValue = 0
  for (let i = 0; i < values.length; i++) {
    if (values[i]! > topValue) {
      topValue = values[i]!
      topIndex = i
    }
  }

  const topFeatureName =
    features.featureNames?.[topIndex] ?? `feat[${topIndex}]`

  const activeTags: string[] = []
  if (tags.isExternal) activeTags.push('external')
  if (tags.isSynthetic) activeTags.push('synthetic')
  if (tags.isTeacherInjected) activeTags.push('teacher')
  if (tags.isReplay) activeTags.push('replay')

  const isMock = rawSummary.kind.includes('mock')

  const description = [
    `[${packet.modality}]`,
    rawSummary.description ?? '',
    isMock ? '(mock)' : '',
    `conf=${confidence.extractionConfidence.toFixed(2)}`,
  ]
    .filter(Boolean)
    .join(' ')

  return {
    id: packet.id,
    modality: packet.modality,
    source: packet.source,
    kind: rawSummary.kind,
    featureCount,
    meanFeatureValue,
    topFeatureIndex: topIndex,
    topFeatureValue: topValue,
    topFeatureName,
    extractionConfidence: confidence.extractionConfidence,
    isMock,
    tags: activeTags,
    description,
  }
}
