import type { ContrastRelation, ContrastRecord, ContrastSummary } from './signalContrastTypes'

const RELATIONS: ContrastRelation[] = [
  'same_object',
  'similar_but_different',
  'same_category',
  'different_category',
  'unrelated',
  'unknown',
]

export function buildContrastSummary(records: ContrastRecord[]): ContrastSummary {
  const relationCounts = Object.fromEntries(RELATIONS.map(relation => [relation, 0])) as Record<ContrastRelation, number>

  for (const record of records) {
    relationCounts[record.relation] += 1
  }

  return {
    totalRecords: records.length,
    relationCounts,
    highConfidenceCount: records.filter(record => record.confidence >= 0.7).length,
    unclearPairs: records
      .filter(record => record.relation === 'unknown' || record.confidence < 0.55)
      .sort((a, b) => a.confidence - b.confidence)
      .slice(0, 5),
    topRelations: [...records]
      .sort((a, b) => b.confidence - a.confidence || b.recurrenceCount - a.recurrenceCount)
      .slice(0, 5),
  }
}
