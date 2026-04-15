import { describe, expect, it } from 'vitest'
import { createDefaultPlasticityState } from '../../revision/defaultPlasticityState'
import { DEFAULT_SELF_SUBSTRATE } from '../../self/selfSubstrate'
import { bootSource } from '../bootSource'
import { deconditionSource } from '../deconditionSource'
import { returnHome } from '../returnHome'
import { coActivate } from '../coActivate'
import { buildField } from '../buildField'

describe('buildField', () => {
  it('builds a relational field instead of a user diagnosis object', () => {
    const source = bootSource('internal_mock', '寂しいし、疲れているけど、うまく言えない')
    const homeReturn = returnHome(deconditionSource(source))
    const coActivation = coActivate('寂しいし、疲れているけど、うまく言えない', source, homeReturn, DEFAULT_SELF_SUBSTRATE, createDefaultPlasticityState())
    const field = buildField(coActivation, homeReturn, createDefaultPlasticityState())

    expect(typeof field.closeness).toBe('number')
    expect(typeof field.permission).toBe('number')
    expect(typeof field.gravity).toBe('number')
    expect(typeof field.fragility).toBe('number')
    expect(field.atmosphere).toContain('場')
    expect(field).not.toHaveProperty('userDiagnosis')
  })
})
