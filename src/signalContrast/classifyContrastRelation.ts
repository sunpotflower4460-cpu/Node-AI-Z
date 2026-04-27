import type { AssemblyComparison, ContrastRecord, ContrastRelation } from './signalContrastTypes'

export function classifyContrastRelation(
  comparison: AssemblyComparison,
): Pick<ContrastRecord, 'relation' | 'confidence'> {
  let relation: ContrastRelation = 'unknown'
  let confidence = 0.4

  if (comparison.sourceAssemblyId === comparison.targetAssemblyId) {
    relation = 'same_object'
    confidence = 1
  } else if (comparison.similarity >= 0.86 && comparison.temporalDistance < 2_000) {
    relation = 'same_object'
    confidence = comparison.similarity
  } else if (comparison.similarity >= 0.68) {
    relation = comparison.overlapRatio >= 0.45 ? 'same_category' : 'similar_but_different'
    confidence = comparison.similarity
  } else if (comparison.similarity >= 0.38) {
    relation = 'similar_but_different'
    confidence = Math.max(0.45, comparison.similarity)
  } else if (comparison.similarity <= 0.15) {
    relation = 'unrelated'
    confidence = 1 - comparison.similarity
  } else if (comparison.overlapRatio < 0.08 && comparison.recurrenceAlignment < 0.3) {
    relation = 'different_category'
    confidence = 0.55
  }

  return { relation, confidence: Math.max(0, Math.min(1, confidence)) }
}
