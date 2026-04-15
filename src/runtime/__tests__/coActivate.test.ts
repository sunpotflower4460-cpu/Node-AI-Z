import { describe, expect, it } from 'vitest'
import { createDefaultPlasticityState } from '../../revision/defaultPlasticityState'
import { DEFAULT_SELF_SUBSTRATE } from '../../self/selfSubstrate'
import { bootSource } from '../bootSource'
import { deconditionSource } from '../deconditionSource'
import { returnHome } from '../returnHome'
import { coActivate } from '../coActivate'

describe('coActivate', () => {
  it('returns separated other/self/belief activations', () => {
    const source = bootSource('internal_mock', '疲れていて、どうしたらいいかまだ言葉にできない')
    const homeReturn = returnHome(deconditionSource(source))
    const result = coActivate('疲れていて、どうしたらいいかまだ言葉にできない', source, homeReturn, DEFAULT_SELF_SUBSTRATE, createDefaultPlasticityState())

    expect(result.otherActivations.some((activation) => activation.id === 'fatigue')).toBe(true)
    expect(result.selfActivations.some((activation) => activation.id === 'care_response')).toBe(true)
    expect(result.beliefActivations.some((activation) => activation.id === 'protecting_aliveness')).toBe(true)
    expect(new Set(result.otherActivations.map((activation) => activation.origin))).toEqual(new Set(['other']))
    expect(new Set(result.selfActivations.map((activation) => activation.origin))).toEqual(new Set(['self']))
    expect(new Set(result.beliefActivations.map((activation) => activation.origin))).toEqual(new Set(['belief']))
  })
})
