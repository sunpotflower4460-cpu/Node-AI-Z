import { describe, it, expect } from 'vitest'
import { buildBindingTeacherRequest } from '../buildBindingTeacherRequest'
import type { Assembly } from '../../signalField/signalFieldTypes'

describe('buildBindingTeacherRequest', () => {
  it('builds a request from assemblies', () => {
    const assemblies: Assembly[] = [
      { id: 'a1', particleIds: ['p0', 'p1'], recurrenceCount: 3, averageCoactivation: 0.7, lastActivatedAt: 100 },
    ]
    const req = buildBindingTeacherRequest(assemblies, { textSummary: 'hello' })
    expect(req.textSummary).toBe('hello')
    expect(req.assemblyHints).toHaveLength(1)
    expect(req.assemblyHints![0]).toContain('a1')
  })
})
