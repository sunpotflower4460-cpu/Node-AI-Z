/**
 * App Facade - Phase M9
 * Application-specific view layer and access control.
 * Determines what each app sees and how it can interact with the core.
 */

import type { AppFacadeConfig } from './coreTypes'

/**
 * Create a default app facade for crystallized thinking mode.
 * This is the current primary mode.
 */
export const createCrystallizedThinkingFacade = (): AppFacadeConfig => {
  return {
    facadeId: 'facade-crystallized-thinking',
    appName: 'crystallized_thinking',
    canReadTrunk: true,
    canReadBranch: true,
    canWriteBranch: true,
    canProposePromotions: true,
    trunkInfluenceWeight: 0.2, // Light trunk influence
    branchInfluenceWeight: 0.8, // Heavy branch influence
    displayPreferences: {
      showTrunkOrigin: true,
      showBranchOrigin: true,
      showPromotionCandidates: true,
    },
    notes: ['Crystallized thinking facade with full access'],
  }
}

/**
 * Create a default app facade for Jibun Kaigi mode.
 * Future: Will have different access patterns.
 */
export const createJibunKaigiFacade = (): AppFacadeConfig => {
  return {
    facadeId: 'facade-jibun-kaigi',
    appName: 'jibun_kaigi',
    canReadTrunk: true,
    canReadBranch: true,
    canWriteBranch: true,
    canProposePromotions: false, // Jibun Kaigi doesn't propose promotions yet
    trunkInfluenceWeight: 0.3,
    branchInfluenceWeight: 0.7,
    displayPreferences: {
      showTrunkOrigin: false, // Simpler view for Jibun Kaigi
      showBranchOrigin: false,
      showPromotionCandidates: false,
    },
    notes: ['Jibun Kaigi facade with read/write access'],
  }
}

/**
 * Create a read-only facade.
 * For apps that only observe, don't modify.
 */
export const createReadOnlyFacade = (appName: string): AppFacadeConfig => {
  return {
    facadeId: `facade-${appName}-readonly`,
    appName,
    canReadTrunk: true,
    canReadBranch: true,
    canWriteBranch: false,
    canProposePromotions: false,
    trunkInfluenceWeight: 0.5,
    branchInfluenceWeight: 0.5,
    displayPreferences: {
      showTrunkOrigin: true,
      showBranchOrigin: true,
      showPromotionCandidates: false,
    },
    notes: [`Read-only facade for ${appName}`],
  }
}

/**
 * Validate facade permissions.
 * Returns true if the facade has permission for the requested action.
 */
export const validateFacadePermission = (
  facade: AppFacadeConfig,
  action: 'read_trunk' | 'read_branch' | 'write_branch' | 'propose_promotion'
): boolean => {
  switch (action) {
    case 'read_trunk':
      return facade.canReadTrunk
    case 'read_branch':
      return facade.canReadBranch
    case 'write_branch':
      return facade.canWriteBranch
    case 'propose_promotion':
      return facade.canProposePromotions
    default:
      return false
  }
}

/**
 * Get effective influence weights for a facade.
 * Normalizes trunk and branch weights to sum to 1.0.
 */
export const getEffectiveInfluenceWeights = (
  facade: AppFacadeConfig
): { trunkWeight: number; branchWeight: number } => {
  const total = facade.trunkInfluenceWeight + facade.branchInfluenceWeight

  if (total === 0) {
    return { trunkWeight: 0.5, branchWeight: 0.5 }
  }

  return {
    trunkWeight: facade.trunkInfluenceWeight / total,
    branchWeight: facade.branchInfluenceWeight / total,
  }
}
