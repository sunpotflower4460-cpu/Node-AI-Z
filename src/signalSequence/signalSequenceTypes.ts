export type SignalSequenceRecord = {
  id: string
  assemblyIds: string[]
  transitionWeights: Record<string, number>
  recurrenceCount: number
  lastObservedAt: number
  predictionConfidence: number
  mismatchCount: number
}

export type SequencePrediction = {
  contextAssemblyIds: string[]
  predictedAssemblyId: string
  confidence: number
}

export type SequenceContextMismatch = {
  contextKey: string
  predictedAssemblyIds: string[]
  actualAssemblyIds: string[]
  mismatchScore: number
}

export type SequenceSummary = {
  totalRecords: number
  predictedNext: SequencePrediction[]
  topSequences: Array<{
    contextAssemblyIds: string[]
    predictionConfidence: number
    recurrenceCount: number
  }>
  totalMismatchCount: number
  mismatchedContexts: SequenceContextMismatch[]
}
