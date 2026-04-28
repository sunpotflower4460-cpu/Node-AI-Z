import { describe, expect, it } from 'vitest'
import { createTextParticleStimulus } from '../../../runtime/createTextParticleStimulus'
import { runSignalModeRuntime } from '../../../runtime/runSignalModeRuntime'
import { buildSignalOverviewSource } from '../../../observe/signalOverviewSource'
import { buildSignalFieldViewModel } from '../buildSignalFieldViewModel'

describe('buildSignalFieldViewModel', () => {
  it('returns a valid SignalFieldViewModel from a signal overview source', async () => {
    const runtimeResult = await runSignalModeRuntime({
      stimulus: createTextParticleStimulus('テスト入力'),
      enableBindingTeacher: true,
      returnSnapshot: false,
      textSummary: 'テスト入力',
    })

    const source = buildSignalOverviewSource(runtimeResult)
    const viewModel = buildSignalFieldViewModel(source)

    expect(typeof viewModel.summary.particleCount).toBe('number')
    expect(typeof viewModel.summary.activeParticleCount).toBe('number')
    expect(typeof viewModel.summary.assemblyCount).toBe('number')
    expect(typeof viewModel.summary.bridgeCount).toBe('number')
    expect(typeof viewModel.summary.teacherFreeBridgeCount).toBe('number')
    expect(Array.isArray(viewModel.particles)).toBe(true)
    expect(Array.isArray(viewModel.assemblies)).toBe(true)
    expect(Array.isArray(viewModel.bridges)).toBe(true)
  })

  it('particles have required display fields', async () => {
    const runtimeResult = await runSignalModeRuntime({
      stimulus: createTextParticleStimulus('粒子テスト'),
      enableBindingTeacher: false,
      returnSnapshot: false,
      textSummary: '粒子テスト',
    })

    const source = buildSignalOverviewSource(runtimeResult)
    const viewModel = buildSignalFieldViewModel(source)

    for (const particle of viewModel.particles) {
      expect(typeof particle.id).toBe('string')
      expect(typeof particle.x).toBe('number')
      expect(typeof particle.y).toBe('number')
      expect(typeof particle.activation).toBe('number')
    }
  })

  it('assemblies are formatted for display', async () => {
    const runtimeResult = await runSignalModeRuntime({
      stimulus: createTextParticleStimulus('assembly テスト'),
      enableBindingTeacher: true,
      returnSnapshot: false,
      textSummary: 'assembly テスト',
    })

    const source = buildSignalOverviewSource(runtimeResult)
    const viewModel = buildSignalFieldViewModel(source)

    for (const assembly of viewModel.assemblies) {
      expect(typeof assembly.id).toBe('string')
      expect(typeof assembly.stabilityScore).toBe('number')
      expect(typeof assembly.recurrenceCount).toBe('number')
      expect(Array.isArray(assembly.particleIds)).toBe(true)
    }
  })

  it('bridges have stage and score fields', async () => {
    const runtimeResult = await runSignalModeRuntime({
      stimulus: createTextParticleStimulus('bridge テスト'),
      enableBindingTeacher: true,
      returnSnapshot: false,
      textSummary: 'bridge テスト',
    })

    const source = buildSignalOverviewSource(runtimeResult)
    const viewModel = buildSignalFieldViewModel(source)

    for (const bridge of viewModel.bridges) {
      expect(typeof bridge.id).toBe('string')
      expect(typeof bridge.stage).toBe('string')
      expect(typeof bridge.teacherDependencyScore).toBe('number')
      expect(typeof bridge.recallSuccessScore).toBe('number')
    }
  })
})
