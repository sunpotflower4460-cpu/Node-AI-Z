import { describe, expect, it } from 'vitest'
import { buildAnalyzeFlowViewModel } from '../buildAnalyzeFlowViewModel'

describe('buildAnalyzeFlowViewModel', () => {
  it('returns idle state when input is empty and no observation', () => {
    const vm = buildAnalyzeFlowViewModel({
      inputText: '',
      isAnalyzing: false,
      hasObservation: false,
    })
    expect(vm.state).toBe('idle')
    expect(vm.canAnalyze).toBe(false)
  })

  it('returns ready state when input is present', () => {
    const vm = buildAnalyzeFlowViewModel({
      inputText: 'some text',
      isAnalyzing: false,
      hasObservation: false,
    })
    expect(vm.state).toBe('ready')
    expect(vm.canAnalyze).toBe(true)
  })

  it('returns analyzing state when isAnalyzing is true', () => {
    const vm = buildAnalyzeFlowViewModel({
      inputText: 'some text',
      isAnalyzing: true,
      hasObservation: false,
    })
    expect(vm.state).toBe('analyzing')
    expect(vm.canAnalyze).toBe(false)
  })

  it('returns completed state when hasObservation is true and not analyzing', () => {
    const vm = buildAnalyzeFlowViewModel({
      inputText: 'some text',
      isAnalyzing: false,
      hasObservation: true,
    })
    expect(vm.state).toBe('completed')
    expect(vm.canAnalyze).toBe(true)
  })

  it('returns error state when errorMessage is set', () => {
    const vm = buildAnalyzeFlowViewModel({
      inputText: '',
      isAnalyzing: false,
      hasObservation: false,
      errorMessage: 'something went wrong',
    })
    expect(vm.state).toBe('error')
    expect(vm.errorMessage).toBe('something went wrong')
  })
})
