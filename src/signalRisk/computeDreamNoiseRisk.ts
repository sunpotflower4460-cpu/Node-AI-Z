import type { SignalFieldState } from '../signalField/signalFieldTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'

export function computeDreamNoiseRisk(
  branch: SignalPersonalBranch,
  fieldState: SignalFieldState,
): number {
  const tentativeBridges = fieldState.crossModalBridges.filter(b => b.stage === 'tentative').length
  const tentativeRatio =
    fieldState.crossModalBridges.length > 0
      ? tentativeBridges / fieldState.crossModalBridges.length
      : 0

  const dreamOnlyAssemblies = branch.assemblyRecords.filter(
    r => r.replayCount > 0 && r.recurrenceCount <= 1,
  ).length
  const dreamOnlyRatio = branch.assemblyRecords.length > 0
    ? dreamOnlyAssemblies / branch.assemblyRecords.length
    : 0

  return Math.min(1, tentativeRatio * 0.5 + dreamOnlyRatio * 0.5)
}
