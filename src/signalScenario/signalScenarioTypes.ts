export type SignalScenarioStep = {
  id: string
  inputType: 'text' | 'image' | 'audio_mock' | 'rest' | 'teacher_hint'
  payload?: unknown
  repeat?: number
  expectedEffect?: string
}

export type SignalScenario = {
  id: string
  name: string
  description: string
  steps: SignalScenarioStep[]
}

export type SignalScenarioStepResult = {
  stepId: string
  success: boolean
  activeAssemblyCount: number
  bridgeCount: number
  recallSuccessCount: number
  teacherDependencyAverage: number
  notes: string[]
}

export type SignalScenarioResult = {
  scenarioId: string
  startedAt: number
  endedAt: number
  stepResults: SignalScenarioStepResult[]
  metrics: {
    assemblyGrowth: number
    bridgeGrowth: number
    teacherDependencyDelta: number
    recallSuccessDelta: number
    overbindingRiskDelta: number
    promotionReadinessDelta: number
  }
  notes: string[]
}
