import type { PlasticityState } from '../revision/types'
import { DEFAULT_SELF_SUBSTRATE } from '../self/selfSubstrate'
import type { SelfSubstrate } from './types'

export const loadSelfSubstrate = (plasticity?: PlasticityState): SelfSubstrate => {
  void plasticity
  return {
    ...DEFAULT_SELF_SUBSTRATE,
    beliefs: DEFAULT_SELF_SUBSTRATE.beliefs.map((belief) => ({ ...belief })),
    tendencies: [...DEFAULT_SELF_SUBSTRATE.tendencies],
    pathwayBiases: [...DEFAULT_SELF_SUBSTRATE.pathwayBiases],
  }
}
