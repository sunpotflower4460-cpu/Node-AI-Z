import { describe, expect, it } from 'vitest'
import { RISK_COPY, RISK_OVERALL_COPY, getRiskCopy } from '../riskCopy'
import type { RiskTypeId } from '../riskCopy'

const RISK_IDS: RiskTypeId[] = ['overbinding', 'falseBinding', 'teacherOvertrust', 'dreamNoise']

describe('RISK_COPY', () => {
  it('has all four risk types', () => {
    for (const id of RISK_IDS) {
      expect(RISK_COPY[id]).toBeDefined()
    }
  })

  it('each risk type has Japanese simple label', () => {
    expect(RISK_COPY.overbinding.simpleLabel).toBe('過結合傾向')
    expect(RISK_COPY.falseBinding.simpleLabel).toBe('誤結合傾向')
    expect(RISK_COPY.teacherOvertrust.simpleLabel).toBe('先生過信傾向')
    expect(RISK_COPY.dreamNoise.simpleLabel).toBe('夢ノイズ傾向')
  })

  it('each risk type has low / medium / high copy', () => {
    for (const id of RISK_IDS) {
      expect(RISK_COPY[id].low).toBeDefined()
      expect(RISK_COPY[id].medium).toBeDefined()
      expect(RISK_COPY[id].high).toBeDefined()
    }
  })

  it('low copy uses gentle language', () => {
    for (const id of RISK_IDS) {
      expect(RISK_COPY[id].low.label).toBe('落ち着いています')
    }
  })

  it('high copy suggests checking but is not alarming', () => {
    for (const id of RISK_IDS) {
      expect(RISK_COPY[id].high.label).toBe('確認が必要です')
    }
  })
})

describe('RISK_OVERALL_COPY', () => {
  it('has low, medium, high entries', () => {
    expect(RISK_OVERALL_COPY.low).toBeDefined()
    expect(RISK_OVERALL_COPY.medium).toBeDefined()
    expect(RISK_OVERALL_COPY.high).toBeDefined()
  })

  it('low uses 安定 in body', () => {
    expect(RISK_OVERALL_COPY.low.body).toContain('安定')
  })
})

describe('getRiskCopy', () => {
  it('returns correct entry', () => {
    const entry = getRiskCopy('overbinding')
    expect(entry.simpleLabel).toBe('過結合傾向')
  })
})
