import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { SignalDevelopmentStage } from '../signalDevelopment/signalDevelopmentTypes'
import type { DevelopmentRequirement } from './developmentDashboardTypes'

export function computeNextStageRequirements(
  branch: SignalPersonalBranch,
  currentStage: SignalDevelopmentStage,
): DevelopmentRequirement[] {
  const requirements: DevelopmentRequirement[] = []

  if (currentStage < 2) {
    requirements.push({
      id: 'assembly_count',
      label: 'Detect at least 1 assembly',
      currentValue: branch.assemblyRecords.length,
      requiredValue: 1,
      satisfied: branch.assemblyRecords.length >= 1,
      notes: [],
    })
  }

  if (currentStage < 3) {
    const teacherConfirmedBridges = branch.bridgeRecords.filter(r => r.teacherConfirmCount > 0).length
    requirements.push({
      id: 'teacher_bridge',
      label: 'At least 1 teacher-confirmed bridge',
      currentValue: teacherConfirmedBridges,
      requiredValue: 1,
      satisfied: teacherConfirmedBridges >= 1,
      notes: [],
    })
  }

  if (currentStage < 4) {
    const selfRecallBridges = branch.bridgeRecords.filter(r => r.selfRecallSuccessCount > 0).length
    requirements.push({
      id: 'self_recall_bridge',
      label: 'At least 1 bridge with self-recall success',
      currentValue: selfRecallBridges,
      requiredValue: 1,
      satisfied: selfRecallBridges >= 1,
      notes: [],
    })
  }

  if (currentStage < 5) {
    requirements.push({
      id: 'contrast_records',
      label: 'At least 1 contrast record',
      currentValue: branch.contrastRecords.length,
      requiredValue: 1,
      satisfied: branch.contrastRecords.length >= 1,
      notes: [],
    })
  }

  if (currentStage < 6) {
    requirements.push({
      id: 'sequence_records',
      label: 'At least 1 sequence record',
      currentValue: branch.sequenceRecords.length,
      requiredValue: 1,
      satisfied: branch.sequenceRecords.length >= 1,
      notes: [],
    })
  }

  if (currentStage < 7) {
    const hasBridgeOrContrast = branch.bridgeRecords.length > 0 || branch.contrastRecords.length > 0
    requirements.push({
      id: 'bridge_or_contrast_with_sequence',
      label: 'Sequence records + at least 1 bridge or contrast',
      currentValue: hasBridgeOrContrast ? 1 : 0,
      requiredValue: 1,
      satisfied: branch.sequenceRecords.length > 0 && hasBridgeOrContrast,
      notes: [],
    })
  }

  if (currentStage < 8) {
    requirements.push({
      id: 'teacher_free_bridge',
      label: 'At least 1 teacher-free bridge',
      currentValue: branch.summary.teacherFreeBridgeCount,
      requiredValue: 1,
      satisfied: branch.summary.teacherFreeBridgeCount >= 1,
      notes: [],
    })
    requirements.push({
      id: 'recall_success_rate',
      label: 'Average recall success >= 0.45',
      currentValue: branch.summary.averageRecallSuccess,
      requiredValue: 0.45,
      satisfied: branch.summary.averageRecallSuccess >= 0.45,
      notes: [],
    })
  }

  return requirements
}
