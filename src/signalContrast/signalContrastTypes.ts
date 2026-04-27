export type ContrastRelation =
  | 'same_object'
  | 'similar_but_different'
  | 'same_category'
  | 'different_category'
  | 'unrelated'
  | 'unknown'

export type AssemblyComparison = {
  sourceAssemblyId: string
  targetAssemblyId: string
  sharedParticleCount: number
  overlapRatio: number
  recurrenceAlignment: number
  temporalDistance: number
  similarity: number
}

export type ContrastRecord = {
  id: string
  sourceAssemblyId: string
  targetAssemblyId: string
  relation: ContrastRelation
  confidence: number
  teacherAssisted: boolean
  selfDiscovered: boolean
  recurrenceCount: number
  lastUpdatedAt: number
}

export type ContrastSummary = {
  totalRecords: number
  relationCounts: Record<ContrastRelation, number>
  highConfidenceCount: number
  unclearPairs: ContrastRecord[]
  topRelations: ContrastRecord[]
}
