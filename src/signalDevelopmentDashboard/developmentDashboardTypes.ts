export type DevelopmentRequirement = {
  id: string
  label: string
  currentValue: number
  requiredValue: number
  satisfied: boolean
  notes: string[]
}

export type SignalDevelopmentDashboard = {
  currentStage: string
  stageProgress: number
  nextStage?: string
  requirements: DevelopmentRequirement[]
  strengths: string[]
  bottlenecks: string[]
  recommendedNextActions: string[]
}
