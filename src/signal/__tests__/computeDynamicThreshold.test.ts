import { describe, expect, it } from 'vitest'
import { computeDynamicThreshold } from '../computeDynamicThreshold'

describe('computeDynamicThreshold', () => {
  it('raises threshold when recent activity is high', () => {
    const base = computeDynamicThreshold(0.5)
    const active = computeDynamicThreshold(0.9)
    expect(active.current).toBeGreaterThan(base.current)
  })

  it('lowers threshold when recent activity is quiet', () => {
    const base = computeDynamicThreshold(0.5)
    const quiet = computeDynamicThreshold(0.1)
    expect(quiet.current).toBeLessThan(base.current)
  })

  it('clamps threshold within min/max bounds', () => {
    const high = computeDynamicThreshold(2)
    const low = computeDynamicThreshold(-1)
    expect(high.current).toBeLessThanOrEqual(0.55)
    expect(low.current).toBeGreaterThanOrEqual(0.2)
  })
})
