import type { SignalAblationConfig } from './signalAblationTypes'

export function createDefaultAblationConfig(): SignalAblationConfig {
  return {
    teacherEnabled: true,
    inhibitionEnabled: true,
    dreamEnabled: true,
    rewardEnabled: true,
    modulatorEnabled: true,
    sequenceMemoryEnabled: true,
    contrastLearningEnabled: true,
    consolidationEnabled: true,
  }
}

export function getDisabledFeatures(config: SignalAblationConfig): string[] {
  const disabled: string[] = []
  if (!config.teacherEnabled) disabled.push('teacher')
  if (!config.inhibitionEnabled) disabled.push('inhibition')
  if (!config.dreamEnabled) disabled.push('dream')
  if (!config.rewardEnabled) disabled.push('reward')
  if (!config.modulatorEnabled) disabled.push('modulator')
  if (!config.sequenceMemoryEnabled) disabled.push('sequenceMemory')
  if (!config.contrastLearningEnabled) disabled.push('contrastLearning')
  if (!config.consolidationEnabled) disabled.push('consolidation')
  return disabled
}
