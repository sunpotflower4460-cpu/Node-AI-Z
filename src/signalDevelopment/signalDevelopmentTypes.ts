export type SignalDevelopmentStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export type StageCapabilities = {
  canDetectAssemblies: boolean
  canUseTeacher: boolean
  canSelfRecall: boolean
  canLearnContrast: boolean
  canTrackSequence: boolean
  canSelectActions: boolean
  canPredictHierarchically: boolean
  canReconsolidate: boolean
  canModulateLearning: boolean
  canExportCandidates: boolean
}

export type SignalDevelopmentState = {
  stage: SignalDevelopmentStage
  label: string
  unlockedCapabilities: string[]
  progressScore: number
  capabilities: StageCapabilities
}
