import type { SignalFieldState, CrossModalBridge } from '../signalField/signalFieldTypes'
import type { BindingTeacherResult } from './bindingTeacherTypes'

export function applyCrossModalBridge(
  state: SignalFieldState,
  sourceAssemblyId: string,
  targetAssemblyId: string,
  teacherResult: BindingTeacherResult,
  timestamp: number,
): SignalFieldState {
  if (teacherResult.relation === 'unrelated' || teacherResult.relation === 'unsure') return state

  const existingBridgeIndex = state.crossModalBridges.findIndex(
    b => b.sourceAssemblyId === sourceAssemblyId && b.targetAssemblyId === targetAssemblyId,
  )

  if (existingBridgeIndex >= 0) {
    const existing = state.crossModalBridges[existingBridgeIndex]!
    const newStage: CrossModalBridge['stage'] =
      existing.stage === 'tentative' ? 'reinforced'
      : existing.stage === 'reinforced' ? 'promoted'
      : 'promoted'
    const updatedBridge: CrossModalBridge = {
      ...existing,
      confidence: Math.min(1, existing.confidence + teacherResult.confidence * 0.3),
      stage: newStage,
    }
    const updated = [...state.crossModalBridges]
    updated[existingBridgeIndex] = updatedBridge
    return { ...state, crossModalBridges: updated }
  }

  const newBridge: CrossModalBridge = {
    id: `bridge_${sourceAssemblyId}_${targetAssemblyId}`,
    sourceAssemblyId,
    targetAssemblyId,
    confidence: teacherResult.confidence,
    stage: 'tentative',
    createdAt: timestamp,
  }

  return { ...state, crossModalBridges: [...state.crossModalBridges, newBridge] }
}
