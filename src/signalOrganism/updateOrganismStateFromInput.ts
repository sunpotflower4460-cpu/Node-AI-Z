import type { PersistentOrganismState, OrganismInputSignal } from './signalOrganismTypes'

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value))
}

/**
 * Updates the persistent organism state after receiving external input.
 *
 * Update rules:
 * - Strong input → small energy consumption, uncertainty/noveltyHunger updates
 * - New assemblies → curiosity up, replayPressure up
 * - Teacher involved → teacherInjectedRatio update, teacherDependency maintained
 * - Teacher-free recall success → teacherDependency slightly down, safety up
 * - High risk → overload/uncertainty up
 */
export function updateOrganismStateFromInput(
  state: PersistentOrganismState,
  signal: OrganismInputSignal,
): PersistentOrganismState {
  const {
    activeParticleCount,
    assemblyCount,
    newAssemblyCount,
    predictionError,
    riskLevel,
    teacherInvolved,
    recallSuccess,
    timestamp,
    inputModality,
  } = signal

  const inputStrength = clamp(activeParticleCount / Math.max(assemblyCount * 5, 10))
  const novelty = clamp(newAssemblyCount / Math.max(assemblyCount, 1))

  // --- regulation ---
  const energyDelta = -(inputStrength * 0.05)
  const curiosityDelta = newAssemblyCount > 0 ? 0.03 : -0.01
  const uncertaintyDelta = predictionError * 0.08 - 0.02
  const safetyDelta = recallSuccess && !teacherInvolved ? 0.03 : -0.01
  const noveltyHungerDelta = novelty > 0.3 ? -0.04 : 0.02
  const replayPressureDelta = newAssemblyCount > 0 ? 0.05 : 0.01
  const consolidationPressureDelta = 0.01
  const overloadDelta = riskLevel * 0.06 - 0.02

  const regulation = {
    energy: clamp(state.regulation.energy + energyDelta),
    curiosity: clamp(state.regulation.curiosity + curiosityDelta),
    uncertainty: clamp(state.regulation.uncertainty + uncertaintyDelta),
    safety: clamp(state.regulation.safety + safetyDelta),
    noveltyHunger: clamp(state.regulation.noveltyHunger + noveltyHungerDelta),
    replayPressure: clamp(state.regulation.replayPressure + replayPressureDelta),
    consolidationPressure: clamp(
      state.regulation.consolidationPressure + consolidationPressureDelta,
    ),
    overload: clamp(state.regulation.overload + overloadDelta),
  }

  // --- continuity ---
  const continuity = {
    ...state.continuity,
    afterglowStrength: clamp(state.continuity.afterglowStrength + inputStrength * 0.1),
    selfEcho: clamp(state.continuity.selfEcho + inputStrength * 0.05),
  }

  // --- sourceBalance ---
  const total = state.lifecycle.totalInputCount + 1
  const prevRatio = (r: number) => r * (total - 1) / total
  const sourceBalance = {
    externalInputRatio: teacherInvolved
      ? clamp(prevRatio(state.sourceBalance.externalInputRatio))
      : clamp(prevRatio(state.sourceBalance.externalInputRatio) + 1 / total),
    internalReplayRatio: clamp(prevRatio(state.sourceBalance.internalReplayRatio)),
    teacherInjectedRatio: teacherInvolved
      ? clamp(prevRatio(state.sourceBalance.teacherInjectedRatio) + 1 / total)
      : clamp(prevRatio(state.sourceBalance.teacherInjectedRatio)),
    selfGeneratedRatio: clamp(prevRatio(state.sourceBalance.selfGeneratedRatio)),
  }

  // --- learning ---
  const teacherDependencyDelta = teacherInvolved
    ? 0.02
    : recallSuccess
      ? -0.03
      : 0
  const teacherFreeRecallDelta = recallSuccess && !teacherInvolved ? 0.05 : -0.01

  const learning = {
    ...state.learning,
    teacherDependency: clamp(state.learning.teacherDependency + teacherDependencyDelta),
    teacherFreeRecallScore: clamp(
      state.learning.teacherFreeRecallScore + teacherFreeRecallDelta,
    ),
  }

  // --- lifecycle ---
  const lifecycle = {
    ...state.lifecycle,
    turnCount: state.lifecycle.turnCount + 1,
    totalInputCount: state.lifecycle.totalInputCount + 1,
  }

  // --- modalityBalance ---
  // Running average: prev_ratio * (n-1)/n + new_increment * 1/n
  const prevModal = state.modalityBalance
  const modalTotal = state.lifecycle.totalInputCount + 1
  const scaleForNewInput = (r: number) => r * (modalTotal - 1) / modalTotal
  const modalityBalance = {
    textRatio: inputModality === 'text'
      ? clamp(scaleForNewInput(prevModal.textRatio) + 1 / modalTotal)
      : clamp(scaleForNewInput(prevModal.textRatio)),
    imageRatio: inputModality === 'image'
      ? clamp(scaleForNewInput(prevModal.imageRatio) + 1 / modalTotal)
      : clamp(scaleForNewInput(prevModal.imageRatio)),
    audioRatio: inputModality === 'audio'
      ? clamp(scaleForNewInput(prevModal.audioRatio) + 1 / modalTotal)
      : clamp(scaleForNewInput(prevModal.audioRatio)),
  }

  return {
    ...state,
    lastActiveAt: timestamp,
    lifecycle,
    regulation,
    continuity,
    sourceBalance,
    modalityBalance,
    learning,
  }
}
