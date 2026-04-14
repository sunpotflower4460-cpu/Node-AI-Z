import { describe, it, expect } from 'vitest'
import { buildHomeState, runHomeCheck, applyReturnAdjustment } from '../homeLayer'
import type { HomeCheckResult, HomeMode, HomeState, NodePipelineResult } from '../../types/nodeStudio'

const VALID_MODES: HomeMode[] = ['stable', 'shaken', 'overperforming', 'withdrawing', 'returning', 'resting']

const makeResult = (vectorOverrides?: Partial<NodePipelineResult['stateVector']>): NodePipelineResult => ({
  inputText: '',
  activatedNodes: [],
  suppressedNodes: [],
  bindings: [],
  liftedPatterns: [],
  stateVector: {
    fragility: 0.3,
    urgency: 0.3,
    depth: 0.3,
    care: 0.3,
    agency: 0.5,
    ambiguity: 0.3,
    change: 0.3,
    stability: 0.5,
    self: 0.5,
    relation: 0.5,
    light: 0.5,
    heaviness: 0.3,
    ...vectorOverrides,
  },
  debugNotes: [],
  meta: { retrievalCount: 0, bindingCount: 0, patternCount: 0, elapsedMs: 0 },
})

const makeHomeCheckResult = (reason: HomeCheckResult['reason']): HomeCheckResult => ({
  needsReturn: reason !== 'none',
  returnMode: reason === 'none' ? 'none' : 'stillness',
  reason,
  homePhrase: 'test phrase',
  released: ['released_item'],
  preserved: ['preserved_item'],
})

describe('buildHomeState', () => {
  it('all values are in [0, 1] range', () => {
    const result = makeResult()
    const home = buildHomeState(result)
    expect(home.worthDetached).toBeGreaterThanOrEqual(0)
    expect(home.worthDetached).toBeLessThanOrEqual(1)
    expect(home.urgencyRelease).toBeGreaterThanOrEqual(0)
    expect(home.urgencyRelease).toBeLessThanOrEqual(1)
    expect(home.expectationRelease).toBeGreaterThanOrEqual(0)
    expect(home.expectationRelease).toBeLessThanOrEqual(1)
    expect(home.belongingSignal).toBeGreaterThanOrEqual(0)
    expect(home.belongingSignal).toBeLessThanOrEqual(1)
    expect(home.safeReturnStrength).toBeGreaterThanOrEqual(0)
    expect(home.safeReturnStrength).toBeLessThanOrEqual(1)
    expect(home.selfNonCollapse).toBeGreaterThanOrEqual(0)
    expect(home.selfNonCollapse).toBeLessThanOrEqual(1)
  })

  it('currentMode is a valid HomeMode string', () => {
    const result = makeResult()
    const home = buildHomeState(result)
    expect(VALID_MODES).toContain(home.currentMode)
  })

  it('high urgency sets overperforming mode', () => {
    const result = makeResult({ urgency: 0.9 })
    const home = buildHomeState(result)
    expect(home.currentMode).toBe('overperforming')
  })

  it('high fragility sets shaken mode', () => {
    const result = makeResult({ urgency: 0.3, fragility: 0.85 })
    const home = buildHomeState(result)
    expect(home.currentMode).toBe('shaken')
  })

  it('high ambiguity sets returning mode', () => {
    const result = makeResult({ urgency: 0.3, fragility: 0.3, ambiguity: 0.9 })
    const home = buildHomeState(result)
    expect(home.currentMode).toBe('returning')
  })
})

describe('runHomeCheck', () => {
  it('high urgency triggers overperformance', () => {
    const result = makeResult({ urgency: 0.9 })
    const home = buildHomeState(result)
    const check = runHomeCheck(result, home)
    expect(check.reason).toBe('overperformance')
    expect(check.needsReturn).toBe(true)
  })

  it('high ambiguity triggers ambiguity_overload', () => {
    const result = makeResult({ urgency: 0.3, ambiguity: 0.95 })
    const home = buildHomeState(result)
    const check = runHomeCheck(result, home)
    expect(check.reason).toBe('ambiguity_overload')
    expect(check.needsReturn).toBe(true)
  })

  it('high fragility triggers fragility', () => {
    const result = makeResult({ urgency: 0.3, ambiguity: 0.3, fragility: 0.9 })
    const home = buildHomeState(result)
    const check = runHomeCheck(result, home)
    expect(check.reason).toBe('fragility')
    expect(check.needsReturn).toBe(true)
  })

  it('very low belongingSignal triggers trust_drop', () => {
    const result = makeResult()
    const home: HomeState = {
      worthDetached: 0.5,
      urgencyRelease: 0.7,
      expectationRelease: 0.7,
      belongingSignal: 0.2,
      safeReturnStrength: 0.5,
      selfNonCollapse: 0.5,
      currentMode: 'stable',
    }
    const check = runHomeCheck(result, home)
    expect(check.reason).toBe('trust_drop')
    expect(check.needsReturn).toBe(true)
  })

  it('no extreme values returns none', () => {
    const result = makeResult()
    const home = buildHomeState(result)
    const check = runHomeCheck(result, home)
    expect(check.reason).toBe('none')
    expect(check.needsReturn).toBe(false)
  })
})

describe('applyReturnAdjustment', () => {
  it('overperformance softens assertive wording', () => {
    const rawText = '整理させてください。ように見えます。'
    const homeCheck = makeHomeCheckResult('overperformance')
    const adjusted = applyReturnAdjustment(rawText, homeCheck)
    expect(adjusted).not.toContain('整理させてください。')
    expect(adjusted.length).toBeGreaterThan(0)
  })

  it('ambiguity_overload weakens assertions', () => {
    const rawText = '整理してみましょう。ように見えます。'
    const homeCheck = makeHomeCheckResult('ambiguity_overload')
    const adjusted = applyReturnAdjustment(rawText, homeCheck)
    expect(adjusted).not.toContain('ように見えます。')
    expect(adjusted.length).toBeGreaterThan(0)
  })

  it('trust_drop adds relational softness line', () => {
    const rawText = 'これはテスト文です。'
    const homeCheck = makeHomeCheckResult('trust_drop')
    const adjusted = applyReturnAdjustment(rawText, homeCheck)
    expect(adjusted).toContain('ちゃんと受け取り続けているので、ここで途切れたことにはしません。')
  })

  it('none reason does not break the text', () => {
    const rawText = 'これはテスト文です。'
    const homeCheck = makeHomeCheckResult('none')
    const adjusted = applyReturnAdjustment(rawText, homeCheck)
    expect(typeof adjusted).toBe('string')
    expect(adjusted.length).toBeGreaterThan(0)
  })
})
