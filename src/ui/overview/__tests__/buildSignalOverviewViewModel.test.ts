import { describe, expect, it } from 'vitest'
import { createTextParticleStimulus } from '../../../runtime/createTextParticleStimulus'
import { runSignalModeRuntime } from '../../../runtime/runSignalModeRuntime'
import { buildSignalOverviewSource } from '../../../observe/signalOverviewSource'
import { buildSignalOverviewViewModel } from '../buildSignalOverviewViewModel'

describe('buildSignalOverviewViewModel', () => {
  it('builds a signal overview view model from the signal summary source', async () => {
    const runtimeResult = await runSignalModeRuntime({
      stimulus: createTextParticleStimulus('似ているけど少し違う刺激を試したい'),
      enableBindingTeacher: true,
      returnSnapshot: true,
      textSummary: '似ているけど少し違う刺激を試したい',
    })

    const viewModel = buildSignalOverviewViewModel({
      mode: 'signal_mode',
      observation: {
        implementationMode: 'crystallized_thinking',
        signalOverviewSource: buildSignalOverviewSource(runtimeResult),
      } as never,
    })

    expect(viewModel.mode).toBe('signal_mode')
    expect(viewModel.modeLabel).toBe('New Signal Mode')
    expect(viewModel.development.currentStage).toContain('Stage')
    expect(Array.isArray(viewModel.development.requirements)).toBe(true)
    expect(typeof viewModel.growth.assemblyCount).toBe('number')
    expect(['low', 'medium', 'high']).toContain(viewModel.risk.level)
  })
})
