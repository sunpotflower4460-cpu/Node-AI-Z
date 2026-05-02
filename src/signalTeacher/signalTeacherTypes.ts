export type BindingCandidateStatus =
  | 'candidate'
  | 'teacher_confirmed'
  | 'teacher_rejected'
  | 'uncertain'
  | 'recalled_once'
  | 'teacher_light'
  | 'teacher_free'
  | 'archived'

export type BindingCandidateSource =
  | 'temporal_cooccurrence'
  | 'user_pairing'
  | 'teacher_suggestion'
  | 'self_recall'
  | 'dream_candidate'

export type SameObjectBindingCandidate = {
  id: string
  createdAt: number
  updatedAt: number
  status: BindingCandidateStatus
  source: BindingCandidateSource
  packetIds: string[]
  modalities: Array<'text' | 'image' | 'audio' | 'synthetic_text' | 'synthetic_image' | 'synthetic_audio'>
  assemblyIds: string[]
  bridgeId?: string
  score: {
    coActivationScore: number
    featureSimilarityScore: number
    temporalProximityScore: number
    teacherConfidence?: number
    selfRecallScore?: number
    overallBindingScore: number
  }
  teacher: {
    teacherChecked: boolean
    teacherJudgmentId?: string
    teacherDependencyScore: number
    teacherConfirmCount: number
    teacherRejectCount: number
  }
  recall: {
    recallAttemptCount: number
    recallSuccessCount: number
    recallFailureCount: number
    lastRecallAt?: number
  }
  risk: {
    falseBindingRisk: number
    overbindingRisk: number
    uncertainty: number
  }
  notes: string[]
}

export type TeacherJudgmentType =
  | 'same_object'
  | 'same_category'
  | 'similar_but_different'
  | 'different'
  | 'uncertain'

export type TeacherJudgment = {
  id: string
  createdAt: number
  candidateId: string
  teacherType: 'mock' | 'llm_stub' | 'human'
  judgment: TeacherJudgmentType
  confidence: number
  explanation: string
  suggestedLabel?: {
    label: string
    confidence: number
    language?: 'ja' | 'en'
  }
  safety: {
    shouldStrengthen: boolean
    shouldHold: boolean
    shouldReject: boolean
    needsMoreEvidence: boolean
  }
}
