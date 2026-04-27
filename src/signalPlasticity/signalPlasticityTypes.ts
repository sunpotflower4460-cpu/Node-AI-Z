export type SignalPlasticityTargetType = 'assembly' | 'bridge' | 'sequence'

export type MultiTimescaleWeight = {
  shortTerm: number
  midTerm: number
  longTerm: number
  lastUpdatedAt: number
}

export type SignalPlasticityRecord = {
  id: string
  targetType: SignalPlasticityTargetType
  targetId: string
  weights: MultiTimescaleWeight
  reinforcementCount: number
}

export type PlasticitySummary = {
  totalRecords: number
  averageEffectiveWeight: number
  topTargets: Array<{
    targetType: SignalPlasticityTargetType
    targetId: string
    effectiveWeight: number
  }>
  longTermDominantCount: number
}
