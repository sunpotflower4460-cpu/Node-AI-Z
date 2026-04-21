/**
 * Facade Capability Policy - Phase M16
 * Defines capability policies for each facade mode
 */

import type { AppFacadeMode } from '../coreTypes'
import type { FacadeCapabilityPolicy } from './facadeRuntimeTypes'

/**
 * Get capability policy for a given facade mode
 */
export const getFacadeCapabilityPolicy = (
  mode: AppFacadeMode
): FacadeCapabilityPolicy => {
  switch (mode) {
    case 'crystallized_thinking':
      return getCrystallizedThinkingPolicy()
    case 'jibun_kaigi':
      return getJibunKaigiPolicy()
    case 'observer':
      return getObserverPolicy()
    case 'future_app':
      return getFutureAppPolicy()
    default:
      return getDefaultPolicy(mode)
  }
}

/**
 * Crystallized Thinking Policy
 * Full access for primary thinking mode
 */
const getCrystallizedThinkingPolicy = (): FacadeCapabilityPolicy => {
  return {
    mode: 'crystallized_thinking',
    readableScopes: ['shared_trunk', 'personal_branch', 'app_facade'],
    writableScopes: ['personal_branch'],
    allowPromotionRead: true,
    allowPromotionWrite: true,
    allowTrunkApplyRead: true,
    allowTrunkApplyWrite: false, // Trunk writes go through guardian
  }
}

/**
 * Jibun Kaigi Policy
 * Full read/write but no promotions
 */
const getJibunKaigiPolicy = (): FacadeCapabilityPolicy => {
  return {
    mode: 'jibun_kaigi',
    readableScopes: ['shared_trunk', 'personal_branch'],
    writableScopes: ['personal_branch'],
    allowPromotionRead: false, // Simpler view
    allowPromotionWrite: false,
    allowTrunkApplyRead: false,
    allowTrunkApplyWrite: false,
  }
}

/**
 * Observer Policy
 * Read-only access for observation and debugging
 */
const getObserverPolicy = (): FacadeCapabilityPolicy => {
  return {
    mode: 'observer',
    readableScopes: ['shared_trunk', 'personal_branch', 'app_facade'],
    writableScopes: [], // Read-only
    allowPromotionRead: true, // Can see promotion state
    allowPromotionWrite: false,
    allowTrunkApplyRead: true, // Can see history
    allowTrunkApplyWrite: false,
  }
}

/**
 * Future App Policy
 * Minimal stub for future apps
 */
const getFutureAppPolicy = (): FacadeCapabilityPolicy => {
  return {
    mode: 'future_app',
    readableScopes: ['personal_branch'], // Minimal access
    writableScopes: [],
    allowPromotionRead: false,
    allowPromotionWrite: false,
    allowTrunkApplyRead: false,
    allowTrunkApplyWrite: false,
  }
}

/**
 * Default Policy
 * Fallback with minimal permissions
 */
const getDefaultPolicy = (mode: AppFacadeMode): FacadeCapabilityPolicy => {
  return {
    mode,
    readableScopes: ['personal_branch'],
    writableScopes: [],
    allowPromotionRead: false,
    allowPromotionWrite: false,
    allowTrunkApplyRead: false,
    allowTrunkApplyWrite: false,
  }
}

/**
 * Validate if a facade has permission for a specific scope
 */
export const validateFacadeScope = (
  policy: FacadeCapabilityPolicy,
  scope: 'read' | 'write',
  layer: 'shared_trunk' | 'personal_branch' | 'app_facade'
): boolean => {
  if (scope === 'read') {
    return policy.readableScopes.includes(layer)
  } else {
    return policy.writableScopes.includes(layer)
  }
}

/**
 * Check if facade can access promotion features
 */
export const canAccessPromotions = (
  policy: FacadeCapabilityPolicy,
  action: 'read' | 'write'
): boolean => {
  return action === 'read' ? policy.allowPromotionRead : policy.allowPromotionWrite
}

/**
 * Check if facade can access trunk safety features
 */
export const canAccessTrunkSafety = (
  policy: FacadeCapabilityPolicy,
  action: 'read' | 'write'
): boolean => {
  return action === 'read' ? policy.allowTrunkApplyRead : policy.allowTrunkApplyWrite
}

/**
 * Get all available facade modes
 */
export const getAllFacadeModes = (): AppFacadeMode[] => {
  return ['crystallized_thinking', 'jibun_kaigi', 'observer', 'future_app']
}

/**
 * Get summary of all policies (for Observe)
 */
export const getAllPoliciesSummary = (): Array<{
  mode: AppFacadeMode
  canRead: string[]
  canWrite: string[]
  features: string[]
}> => {
  return getAllFacadeModes().map((mode) => {
    const policy = getFacadeCapabilityPolicy(mode)
    const features: string[] = []

    if (policy.allowPromotionRead) features.push('promotion_read')
    if (policy.allowPromotionWrite) features.push('promotion_write')
    if (policy.allowTrunkApplyRead) features.push('trunk_history_read')
    if (policy.allowTrunkApplyWrite) features.push('trunk_operations')

    return {
      mode,
      canRead: policy.readableScopes,
      canWrite: policy.writableScopes,
      features,
    }
  })
}
