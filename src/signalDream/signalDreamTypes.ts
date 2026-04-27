export type DreamCandidate = {
  id: string
  sourceAssemblyId: string
  targetAssemblyId: string
  origin:
    | 'teacher_dependency_bridge'
    | 'contrast_gap'
    | 'sequence_bridge'
    | 'promotion_probe'
  supportScore: number
}

export type DreamBridgeEvaluation = {
  candidateId: string
  accepted: boolean
  confidence: number
  notes: string[]
}

export type DreamExplorationResult = {
  candidates: DreamCandidate[]
  evaluations: DreamBridgeEvaluation[]
  strengthenedBridgeIds: string[]
  createdBridgeIds: string[]
  notes: string[]
}

export type DreamSummary = {
  candidateCount: number
  acceptedCount: number
  strengthenedBridgeIds: string[]
  createdBridgeIds: string[]
  notes: string[]
}
