import { describe, expect, it } from 'vitest'
import { observeChecks } from '../observeChecks'

describe('observeChecks', () => {
  it('has checks', () => {
    expect(observeChecks.length).toBeGreaterThan(0)
  })
})
