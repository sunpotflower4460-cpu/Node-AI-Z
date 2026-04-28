import { describe, expect, it } from 'vitest'
import { createTextParticleStimulus } from '../../../runtime/createTextParticleStimulus'
import { runSignalModeRuntime } from '../../../runtime/runSignalModeRuntime'
import { buildSignalOverviewSource } from '../../../observe/signalOverviewSource'
import { buildGrowthViewModel } from '../buildGrowthViewModel'

describe('buildGrowthViewModel', () => {
  it('returns a GrowthViewModel with summary and empty record lists from branch summary', async () => {
    const runtimeResult = await runSignalModeRuntime({
      stimulus: createTextParticleStimulus('成長テスト'),
      enableBindingTeacher: true,
      returnSnapshot: false,
      textSummary: '成長テスト',
    })

    const source = buildSignalOverviewSource(runtimeResult)
    const viewModel = buildGrowthViewModel(source)

    expect(typeof viewModel.summary.assemblyCount).toBe('number')
    expect(typeof viewModel.summary.bridgeCount).toBe('number')
    expect(typeof viewModel.summary.protoSeedCount).toBe('number')
    expect(typeof viewModel.summary.teacherFreeBridgeCount).toBe('number')
    expect(typeof viewModel.summary.averageRecallSuccess).toBe('number')
    expect(Array.isArray(viewModel.assemblies)).toBe(true)
    expect(Array.isArray(viewModel.bridges)).toBe(true)
    expect(Array.isArray(viewModel.protoSeeds)).toBe(true)
    expect(Array.isArray(viewModel.recallEvents)).toBe(true)
  })

  it('summary teacherFreeBridgeCount is a non-negative number', async () => {
    const runtimeResult = await runSignalModeRuntime({
      stimulus: createTextParticleStimulus('teacher free テスト'),
      enableBindingTeacher: true,
      returnSnapshot: false,
      textSummary: 'teacher free テスト',
    })

    const source = buildSignalOverviewSource(runtimeResult)
    const viewModel = buildGrowthViewModel(source)

    expect(viewModel.summary.teacherFreeBridgeCount).toBeGreaterThanOrEqual(0)
  })

  it('bridges in growth view have required stage fields', async () => {
    const runtimeResult = await runSignalModeRuntime({
      stimulus: createTextParticleStimulus('bridge stage テスト'),
      enableBindingTeacher: true,
      returnSnapshot: false,
      textSummary: 'bridge stage テスト',
    })

    const source = buildSignalOverviewSource(runtimeResult)
    const viewModel = buildGrowthViewModel(source)

    for (const bridge of viewModel.bridges) {
      expect(typeof bridge.stage).toBe('string')
      expect(typeof bridge.teacherDependencyScore).toBe('number')
      expect(typeof bridge.recallSuccessScore).toBe('number')
    }
  })
})
