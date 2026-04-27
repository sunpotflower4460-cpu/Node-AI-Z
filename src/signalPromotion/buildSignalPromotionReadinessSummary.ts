import type {
  SignalPromotionReadiness,
  SignalPromotionReadinessSummary,
} from './signalPromotionReadinessTypes'

/**
 * Build a summary of promotion readiness across all candidates.
 *
 * Groups candidates by recommendation and identifies top candidates
 * for each type (assembly, bridge, proto-seed).
 */
export function buildSignalPromotionReadinessSummary(
  allReadiness: SignalPromotionReadiness[],
): SignalPromotionReadinessSummary {
  const readyCount = allReadiness.filter(
    r => r.recommendedAction === 'candidate_for_mother_export',
  ).length

  const waitCount = allReadiness.filter(r => r.recommendedAction === 'wait').length

  const motherExportCandidateCount = readyCount

  const highNoiseRiskCount = allReadiness.filter(r => r.noiseRisk > 0.6).length

  // Get top candidates by type
  const assemblyCandidates = allReadiness
    .filter(r => r.targetType === 'assembly')
    .sort((a, b) => b.readinessScore - a.readinessScore)
    .slice(0, 5)

  const bridgeCandidates = allReadiness
    .filter(r => r.targetType === 'bridge')
    .sort((a, b) => b.readinessScore - a.readinessScore)
    .slice(0, 5)

  const protoSeedCandidates = allReadiness
    .filter(r => r.targetType === 'proto_seed')
    .sort((a, b) => b.readinessScore - a.readinessScore)
    .slice(0, 5)

  return {
    readyCount,
    waitCount,
    motherExportCandidateCount,
    highNoiseRiskCount,
    topAssemblyCandidates: assemblyCandidates,
    topBridgeCandidates: bridgeCandidates,
    topProtoSeedCandidates: protoSeedCandidates,
  }
}
