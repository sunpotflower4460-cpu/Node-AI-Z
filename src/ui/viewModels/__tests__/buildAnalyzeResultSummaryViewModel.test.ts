import { describe, expect, it } from 'vitest'
import { buildAnalyzeResultSummaryViewModel } from '../buildAnalyzeResultSummaryViewModel'

describe('buildAnalyzeResultSummaryViewModel', () => {
  it('returns hasResult=false when no current observation', () => {
    const vm = buildAnalyzeResultSummaryViewModel({
      currentObservation: null,
      previousObservation: null,
    })
    expect(vm.hasResult).toBe(false)
  })

  it('includes a fallback recommended tab even with no signal data', () => {
    const obs = {
      id: '1',
      type: 'observe' as const,
      runtimeMode: 'node' as const,
      text: 'test',
      timestamp: '2024-01-01T00:00:00Z',
      time: '00:00:00',
      pipelineResult: { meta: { bindingCount: 0, patternCount: 0, retrievalCount: 0 }, activatedNodes: [], bindings: [], liftedPatterns: [] } as any,
      studioView: {} as any,
      revisionEntry: { proposedChanges: [] } as any,
      assistantReply: 'test',
    }
    const vm = buildAnalyzeResultSummaryViewModel({
      currentObservation: obs,
      previousObservation: null,
    })
    expect(vm.hasResult).toBe(true)
    expect(vm.recommendedTabs.length).toBeGreaterThan(0)
  })

  it('shows baseline message when no assembly growth', () => {
    const obs = {
      id: '1',
      type: 'observe' as const,
      runtimeMode: 'node' as const,
      text: 'test',
      timestamp: '2024-01-01T00:00:00Z',
      time: '00:00:00',
      pipelineResult: { meta: { bindingCount: 0, patternCount: 0, retrievalCount: 0 }, activatedNodes: [], bindings: [], liftedPatterns: [] } as any,
      studioView: {} as any,
      revisionEntry: { proposedChanges: [] } as any,
      assistantReply: 'test',
    }
    const vm = buildAnalyzeResultSummaryViewModel({
      currentObservation: obs,
      previousObservation: null,
    })
    expect(vm.summaryText).toContain('baseline')
  })
})
