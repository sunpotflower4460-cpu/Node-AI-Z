import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalFieldState } from '../signalField/signalFieldTypes'

export function computeOverbindingRisk(
  branch: SignalPersonalBranch,
  fieldState: SignalFieldState,
  windowMs = 60_000,
): number {
  const now = Date.now()

  const recentBridges = branch.bridgeRecords.filter(r => now - r.lastUsedAt < windowMs)
  const bridgeRate = recentBridges.length / Math.max(1, branch.assemblyRecords.length)

  const bridgeToAssemblyRatio =
    branch.bridgeRecords.length / Math.max(1, branch.assemblyRecords.length)

  const sameObjectCount = branch.contrastRecords.filter(r => r.relation === 'same_object').length
  const contrastRatio = branch.contrastRecords.length > 0
    ? sameObjectCount / branch.contrastRecords.length
    : 0

  const tentativeBridges = fieldState.crossModalBridges.filter(b => b.stage === 'tentative').length
  const tentativeRatio = tentativeBridges / Math.max(1, fieldState.crossModalBridges.length)

  const risk = Math.min(
    1,
    bridgeRate * 0.3 +
    Math.max(0, bridgeToAssemblyRatio - 2) * 0.1 +
    contrastRatio * 0.3 +
    tentativeRatio * 0.3,
  )

  return risk
}
