import type { PlasticityState } from './types'

export const PLASTICITY_LIMITS = {
  node: 0.08,
  relation: 0.12,
  pattern: 0.12,
  homeTrigger: 0.1,
  tone: 0.16,
  pathway: 0.12,
} as const

export const clampNumber = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

export const clampPlasticityValue = (value: number, limit: number) => clampNumber(value, -limit, limit)

export const createDefaultPlasticityState = (): PlasticityState => ({
  nodeBoosts: {},
  relationBoosts: {},
  patternBoosts: {},
  homeTriggerBoosts: {},
  toneBiases: {},
  pathwayBoosts: {},
  lastUpdated: new Date().toISOString(),
})
