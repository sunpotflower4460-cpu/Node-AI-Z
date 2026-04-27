export type InternalQuestion = {
  id: string
  questionType:
    | 'teacher_dependency'
    | 'contrast'
    | 'sequence'
    | 'promotion'
    | 'stability'
  targetId: string
  prompt: string
  priority: number
  suggestedAction: 'replay' | 'compare' | 'ask_teacher' | 'observe_next_turn' | 'strengthen'
}

export type InternalQuestionSummary = {
  totalQuestions: number
  topQuestions: InternalQuestion[]
}
