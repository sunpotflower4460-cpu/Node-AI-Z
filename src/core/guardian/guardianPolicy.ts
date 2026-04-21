/**
 * Guardian Policy - Phase M11
 * Determines guardian mode based on risk level and configuration.
 */

import type { GuardianPolicy, GuardianMode } from './guardianTypes'
import type { PromotionRiskLevel } from '../promotion/promotionTypes'

/**
 * Default guardian policy
 * Balanced approach: guardian-assisted for most cases.
 */
export const defaultGuardianPolicy: GuardianPolicy = {
  mode: 'guardian_assisted',
  autoApproveLowRisk: true,
  requireGuardianForMediumRisk: true,
  requireHumanForHighRisk: true,
}

/**
 * Resolve guardian mode for a candidate based on risk level and policy.
 */
export const resolveGuardianMode = (
  riskLevel: PromotionRiskLevel,
  policy: GuardianPolicy
): GuardianMode => {
  // High risk: human required if policy says so
  if (riskLevel === 'high' && policy.requireHumanForHighRisk) {
    return 'human_required'
  }

  // Medium risk: guardian assisted if policy says so
  if (riskLevel === 'medium' && policy.requireGuardianForMediumRisk) {
    return 'guardian_assisted'
  }

  // Low risk: system only if auto-approve is enabled
  if (riskLevel === 'low' && policy.autoApproveLowRisk) {
    return 'system_only'
  }

  // Default to policy mode
  return policy.mode
}

/**
 * Get guardian policy.
 * In the future, this could load from config or environment.
 */
export const getGuardianPolicy = (): GuardianPolicy => {
  return defaultGuardianPolicy
}
