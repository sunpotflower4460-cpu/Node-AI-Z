import type { SignalFieldState } from '../signalField/signalFieldTypes'
import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalLoopState } from '../signalLoop/signalLoopTypes'
import type { SignalConsolidationState } from '../signalConsolidation/signalConsolidationTypes'
import type { SignalAttentionBudget } from '../signalAttention/signalAttentionTypes'
import type { SignalScenarioStep, SignalScenarioStepResult } from './signalScenarioTypes'
import type { SignalAblationConfig } from '../signalAblation/signalAblationTypes'
import { runSignalModeRuntime } from '../runtime/runSignalModeRuntime'
import { applyAblationConfig } from '../signalAblation/applyAblationConfig'

export type ScenarioStepState = {
  fieldState: SignalFieldState | undefined
  personalBranch: SignalPersonalBranch | undefined
  loopState: SignalLoopState | undefined
  consolidationState: SignalConsolidationState | undefined
  attentionBudget: SignalAttentionBudget | undefined
}

export async function runScenarioStep(
  step: SignalScenarioStep,
  state: ScenarioStepState,
  ablation?: SignalAblationConfig,
  baseTimestamp = Date.now(),
): Promise<{ result: SignalScenarioStepResult; nextState: ScenarioStepState }> {
  const payload = (step.payload as Record<string, unknown> | undefined) ?? {}

  if (step.inputType === 'rest') {
    const notes = ['rest step: no stimulus applied']
    const branch = state.personalBranch
    return {
      result: {
        stepId: step.id,
        success: true,
        activeAssemblyCount: branch?.assemblyRecords.length ?? 0,
        bridgeCount: branch?.bridgeRecords.length ?? 0,
        recallSuccessCount: branch?.recentRecallEvents.filter(e => e.success).length ?? 0,
        teacherDependencyAverage: branch?.summary.averageTeacherDependency ?? 0,
        notes,
      },
      nextState: state,
    }
  }

  const modality = step.inputType === 'image' ? 'image' : step.inputType === 'audio_mock' ? 'audio' : 'text'
  const isTeacherHint = step.inputType === 'teacher_hint'

  const runtimeInput = applyAblationConfig(
    {
      stimulus: {
        modality,
        vector: [0.8, 0.5, 0.3],
        strength: 0.8,
        timestamp: baseTimestamp,
      },
      existingBranch: state.personalBranch,
      existingLoopState: state.loopState,
      existingFieldState: state.fieldState,
      existingConsolidationState: state.consolidationState,
      existingAttentionBudget: state.attentionBudget,
      enableBindingTeacher: isTeacherHint,
      textSummary: typeof payload.text === 'string' ? payload.text : undefined,
      imageSummary: typeof payload.image === 'string' ? payload.image : undefined,
      isUserActive: step.inputType !== 'rest',
      recentActivityLevel: 0.5,
    },
    ablation,
  )

  const runtimeResult = await runSignalModeRuntime(runtimeInput)
  const branch = runtimeResult.personalBranch

  return {
    result: {
      stepId: step.id,
      success: true,
      activeAssemblyCount: branch.assemblyRecords.length,
      bridgeCount: branch.bridgeRecords.length,
      recallSuccessCount: branch.recentRecallEvents.filter(e => e.success).length,
      teacherDependencyAverage: branch.summary.averageTeacherDependency,
      notes: [],
    },
    nextState: {
      fieldState: runtimeResult.fieldState,
      personalBranch: branch,
      loopState: runtimeResult.loopState,
      consolidationState: runtimeResult.consolidationState,
      attentionBudget: runtimeResult.attentionBudget,
    },
  }
}
