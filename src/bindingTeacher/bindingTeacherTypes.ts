export type BindingTeacherRequest = {
  textSummary?: string
  imageSummary?: string
  audioSummary?: string
  assemblyHints?: string[]
}

export type BindingTeacherResult = {
  relation: 'same_object' | 'closely_related' | 'weakly_related' | 'unrelated' | 'unsure'
  confidence: number
  labelCandidate?: string
  reasons: string[]
}
