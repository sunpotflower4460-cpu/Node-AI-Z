import { describe, expect, it } from 'vitest'
import { createTextParticleStimulus } from '../../../runtime/createTextParticleStimulus'
import { runSignalModeRuntime } from '../../../runtime/runSignalModeRuntime'
import { buildSignalOverviewSource } from '../../../observe/signalOverviewSource'
import { buildTeacherDependencyViewModel } from '../buildTeacherDependencyViewModel'

describe('buildTeacherDependencyViewModel', () => {
  it('returns a valid TeacherDependencyViewModel', async () => {
    const runtimeResult = await runSignalModeRuntime({
      stimulus: createTextParticleStimulus('teacher テスト'),
      enableBindingTeacher: true,
      returnSnapshot: false,
      textSummary: 'teacher テスト',
    })

    const source = buildSignalOverviewSource(runtimeResult)
    const viewModel = buildTeacherDependencyViewModel(source)

    expect(typeof viewModel.averageTeacherDependency).toBe('number')
    expect(typeof viewModel.teacherFreeBridgeCount).toBe('number')
    expect(typeof viewModel.teacherAssistedBridgeCount).toBe('number')
    expect(typeof viewModel.teacherLightBridgeCount).toBe('number')
    expect(typeof viewModel.teacherOvertrustRisk).toBe('number')
    expect(typeof viewModel.hasOvertrustRisk).toBe('boolean')
    expect(typeof viewModel.bridgeStageDistribution).toBe('object')
    expect(Array.isArray(viewModel.bridges)).toBe(true)
  })

  it('returns bridge stage distribution with all 5 stages', async () => {
    const runtimeResult = await runSignalModeRuntime({
      stimulus: createTextParticleStimulus('stage 分布テスト'),
      enableBindingTeacher: true,
      returnSnapshot: false,
      textSummary: 'stage 分布テスト',
    })

    const source = buildSignalOverviewSource(runtimeResult)
    const viewModel = buildTeacherDependencyViewModel(source)

    const dist = viewModel.bridgeStageDistribution
    expect(typeof dist.tentative).toBe('number')
    expect(typeof dist.reinforced).toBe('number')
    expect(typeof dist.teacher_light).toBe('number')
    expect(typeof dist.teacher_free).toBe('number')
    expect(typeof dist.promoted).toBe('number')
  })

  it('teacher-free bridge count is non-negative', async () => {
    const runtimeResult = await runSignalModeRuntime({
      stimulus: createTextParticleStimulus('teacher free count テスト'),
      enableBindingTeacher: true,
      returnSnapshot: false,
      textSummary: 'teacher free count テスト',
    })

    const source = buildSignalOverviewSource(runtimeResult)
    const viewModel = buildTeacherDependencyViewModel(source)

    expect(viewModel.teacherFreeBridgeCount).toBeGreaterThanOrEqual(0)
  })
})
