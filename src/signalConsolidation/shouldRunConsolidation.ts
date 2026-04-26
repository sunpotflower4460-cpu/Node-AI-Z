import type {
  SignalConsolidationInput,
  SignalConsolidationState,
} from './signalConsolidationTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'

/**
 * Determine whether consolidation should run.
 *
 * Consolidation is triggered when:
 * - User is not currently active
 * - Recent activity level is low
 * - Sufficient time/turns have passed since last consolidation
 * - There are unprocessed assemblies or bridges
 */
export function shouldRunConsolidation(
  input: SignalConsolidationInput,
  consolidationState: SignalConsolidationState,
  branch: SignalPersonalBranch,
): boolean {
  const timeSinceLastConsolidation = input.now - consolidationState.lastConsolidatedAt
  const minConsolidationInterval = 30000 // 30 seconds

  // Don't consolidate if user is actively interacting
  if (input.isUserActive) {
    return false
  }

  // Don't consolidate if recent activity is too high
  if (input.recentActivityLevel > 0.7) {
    return false
  }

  // Don't consolidate too frequently
  if (timeSinceLastConsolidation < minConsolidationInterval) {
    return false
  }

  // Consolidate if there are enough patterns to process
  const hasEnoughAssemblies = branch.assemblyRecords.length > 3
  const hasEnoughBridges = branch.bridgeRecords.length > 2

  return hasEnoughAssemblies || hasEnoughBridges
}
