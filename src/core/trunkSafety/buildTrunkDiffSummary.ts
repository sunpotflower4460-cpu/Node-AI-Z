import type { BuildTrunkDiffSummaryInput } from './trunkSafetyTypes'

const MAX_ITEMS = 3

const round = (value: number): string => value.toFixed(2)

const summarizeNumericMap = (
  label: string,
  before: Record<string, number>,
  after: Record<string, number>,
): string[] => {
  const changedKeys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]))
    .filter((key) => (before[key] ?? 0) !== (after[key] ?? 0))
    .slice(0, MAX_ITEMS)

  if (changedKeys.length === 0) {
    return []
  }

  return changedKeys.map((key) => {
    const previous = before[key] ?? 0
    const next = after[key] ?? 0
    return `${label} ${key}: ${round(previous)} → ${round(next)}`
  })
}

export const buildTrunkDiffSummary = ({
  before,
  after,
  candidate,
}: BuildTrunkDiffSummaryInput): string[] => {
  const summary: string[] = []

  const beforeSchemaMap = new Map(before.schemaPatterns.map((pattern) => [pattern.key, pattern]))
  const addedSchemas = after.schemaPatterns
    .filter((pattern) => !beforeSchemaMap.has(pattern.key))
    .slice(0, MAX_ITEMS)
  const strengthenedSchemas = after.schemaPatterns
    .filter((pattern) => {
      const previous = beforeSchemaMap.get(pattern.key)
      return previous && previous.strength !== pattern.strength
    })
    .slice(0, MAX_ITEMS)

  if (addedSchemas.length > 0) {
    summary.push(`schemaPatterns +${addedSchemas.length}: ${addedSchemas.map((pattern) => pattern.key).join(', ')}`)
  }

  strengthenedSchemas.forEach((pattern) => {
    const previous = beforeSchemaMap.get(pattern.key)
    if (!previous) return
    summary.push(
      `schema strength ${pattern.key}: ${round(previous.strength)} → ${round(pattern.strength)}`
    )
  })

  const beforeNodeMap = new Map(before.promotedMixedNodes.map((node) => [node.key, node]))
  const addedNodes = after.promotedMixedNodes
    .filter((node) => !beforeNodeMap.has(node.key))
    .slice(0, MAX_ITEMS)

  if (addedNodes.length > 0) {
    summary.push(`promotedMixedNodes +${addedNodes.length}: ${addedNodes.map((node) => node.key).join(', ')}`)
  }

  summary.push(
    ...summarizeNumericMap('conceptualBiases', before.conceptualBiases, after.conceptualBiases),
    ...summarizeNumericMap('protoMeaningBias', before.protoMeaningBias, after.protoMeaningBias),
    ...summarizeNumericMap('optionDetectionBias', before.optionDetectionBias, after.optionDetectionBias),
  )

  if (candidate && summary.length === 0) {
    summary.push(`No shared trunk diff detected for candidate ${candidate.id} (${candidate.type})`)
  }

  return summary
}
