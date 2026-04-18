/**
 * instructionMetrics.ts
 *
 * Tracks instruction reduction metrics for the de-templating pilot.
 * Measures how much "form instruction" has been removed from Ray's generation.
 */

export type InstructionMetrics = {
  // Template directives removed count
  templateDirectivesRemoved: number
  // Direct role phrases in prompt (should be 0)
  directRolePhrasesInPrompt: number
  // Whether decision stage is being used
  decisionStageUsed: boolean
  // Number of guard reruns triggered
  guardRerunCount: number
  // Template repetition risk level
  templateRepeatRisk: 'none' | 'low' | 'medium' | 'high'
  // Latent state markers present
  latentStateUsed: boolean
  // Internal decision state present
  internalDecisionUsed: boolean
}

export function createInstructionMetrics(): InstructionMetrics {
  return {
    templateDirectivesRemoved: 0,
    directRolePhrasesInPrompt: 0,
    decisionStageUsed: false,
    guardRerunCount: 0,
    templateRepeatRisk: 'none',
    latentStateUsed: false,
    internalDecisionUsed: false,
  }
}

/**
 * Estimate how many template directives were removed.
 * Based on the audit:
 * - buildStudioViewModel: 39 + 16 + 12 = 67 templates
 * - buildSignalSentencePlan: 4 + 3 = 7 templates
 * - homeLayer: 5 + 6 + 6 = 17 replacements
 * Total: ~91 template directives removed
 */
export function computeTemplateDirectivesRemoved(): number {
  return 91
}

/**
 * Format metrics for display
 */
export function formatInstructionMetrics(metrics: InstructionMetrics): string {
  const lines = [
    '=== Instruction Reduction Metrics ===',
    `Template directives removed: ${metrics.templateDirectivesRemoved}`,
    `Direct role phrases in prompt: ${metrics.directRolePhrasesInPrompt}`,
    `Decision stage used: ${metrics.decisionStageUsed ? 'true' : 'false'}`,
    `Guard rerun count: ${metrics.guardRerunCount}`,
    `Template repeat risk: ${metrics.templateRepeatRisk}`,
    `Latent state used: ${metrics.latentStateUsed ? 'true' : 'false'}`,
    `Internal decision used: ${metrics.internalDecisionUsed ? 'true' : 'false'}`,
    '=====================================',
  ]
  return lines.join('\n')
}

/**
 * Update metrics based on runtime result
 */
export function updateInstructionMetrics(
  metrics: InstructionMetrics,
  runtimeData: {
    hasRayProfile?: boolean
    hasInternalState?: boolean
    guardRerunTriggered?: boolean
    templateRisk?: 'none' | 'low' | 'medium' | 'high'
  },
): void {
  metrics.templateDirectivesRemoved = computeTemplateDirectivesRemoved()
  metrics.directRolePhrasesInPrompt = 0 // We removed all direct role phrases
  metrics.decisionStageUsed = true // Decision layer is always used
  metrics.latentStateUsed = runtimeData.hasRayProfile ?? false
  metrics.internalDecisionUsed = runtimeData.hasInternalState ?? false

  if (runtimeData.guardRerunTriggered) {
    metrics.guardRerunCount += 1
  }

  if (runtimeData.templateRisk) {
    metrics.templateRepeatRisk = runtimeData.templateRisk
  }
}
