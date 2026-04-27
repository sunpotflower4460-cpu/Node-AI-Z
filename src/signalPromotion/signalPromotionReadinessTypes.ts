/**
 * Signal Promotion Readiness Types
 *
 * Evaluates when assemblies, bridges, and proto-seeds are ready
 * to be promoted (e.g., to Mother Core or shared trunk).
 */

export type SignalPromotionReadiness = {
  targetId: string
  targetType: 'assembly' | 'bridge' | 'proto_seed'
  readinessScore: number
  recurrenceScore: number
  replayScore: number
  recallScore: number
  stabilityScore: number
  teacherIndependenceScore: number
  noiseRisk: number
  recommendedAction: 'wait' | 'strengthen_personal' | 'candidate_for_mother_export'
  notes: string[]
}

export type SignalPromotionReadinessSummary = {
  readyCount: number
  waitCount: number
  motherExportCandidateCount: number
  highNoiseRiskCount: number
  topAssemblyCandidates: SignalPromotionReadiness[]
  topBridgeCandidates: SignalPromotionReadiness[]
  topProtoSeedCandidates: SignalPromotionReadiness[]
}
