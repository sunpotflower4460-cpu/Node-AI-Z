import { createStableParticleField } from '../signalField/createStableParticleField'
import { igniteParticles } from '../signalField/igniteParticles'
import { propagateActivation } from '../signalField/propagateActivation'
import { applyRefractory } from '../signalField/applyRefractory'
import { applyHomeostasis } from '../signalField/applyHomeostasis'
import { applyHebbianPlasticity } from '../signalField/applyHebbianPlasticity'
import { applyDecay } from '../signalField/applyDecay'
import { runReplayCycle } from '../signalField/runReplayCycle'
import { detectAssemblies } from '../signalField/detectAssemblies'
import { promoteProtoMeanings } from '../signalField/promoteProtoMeanings'
import { recallFromAssemblies } from '../signalField/recallFromAssemblies'
import type { SignalFieldState, ParticleStimulus, ActivationEvent } from '../signalField/signalFieldTypes'
import { buildBindingTeacherRequest } from '../bindingTeacher/buildBindingTeacherRequest'
import { resolveBindingTeacher } from '../bindingTeacher/resolveBindingTeacher'
import { applyCrossModalBridge } from '../bindingTeacher/applyCrossModalBridge'

export type SignalFieldRuntimeInput = {
  stimulus: ParticleStimulus
  existingState?: SignalFieldState
  enableBindingTeacher?: boolean
  textSummary?: string
  imageSummary?: string
  audioSummary?: string
}

export type SignalFieldObserveSummary = {
  particleCount: number
  activeParticleCount: number
  strongestActivationRegions: { x: number; y: number; activation: number }[]
  assemblyCount: number
  newlyDetectedAssemblies: string[]
  protoMeaningCount: number
  crossModalBridgeCount: number
  recallEvents: ActivationEvent[]
  bindingTeacherResult?: import('../bindingTeacher/bindingTeacherTypes').BindingTeacherResult
  frameCount: number
}

export type SignalFieldRuntimeResult = {
  state: SignalFieldState
  observe: SignalFieldObserveSummary
}

let _stableField: SignalFieldState | null = null

function getOrInitStableField(): SignalFieldState {
  if (!_stableField) {
    _stableField = createStableParticleField()
  }
  return _stableField
}

export async function runSignalFieldRuntime(input: SignalFieldRuntimeInput): Promise<SignalFieldRuntimeResult> {
  const timestamp = input.stimulus.timestamp
  let state = input.existingState ?? getOrInitStableField()
  state = { ...state, frameCount: state.frameCount + 1 }

  // 1. Ignite
  const { state: afterIgnite, events: igniteEvents } = igniteParticles(state, input.stimulus)
  state = afterIgnite

  // 2. Propagate
  const { state: afterProp, events: propEvents } = propagateActivation(state, timestamp)
  state = afterProp

  // 3. Refractory / homeostasis / decay
  state = applyRefractory(state)
  state = applyHomeostasis(state)
  state = applyDecay(state)

  // 4. Hebbian plasticity
  const allEvents: ActivationEvent[] = [...igniteEvents, ...propEvents]
  state = applyHebbianPlasticity(state, allEvents)

  // 5. Assembly detection
  state = detectAssemblies(state, state.recentActivations)

  // 6. Replay
  const { state: afterReplay } = runReplayCycle(state, timestamp)
  state = afterReplay

  // 7. Proto-meaning promotion
  const prevProtoCount = state.protoMeanings.length
  state = promoteProtoMeanings(state, timestamp)
  const newProtoMeanings = state.protoMeanings.slice(prevProtoCount)

  // 8. Binding teacher (optional)
  let bindingTeacherResult
  if (input.enableBindingTeacher && state.assemblies.length >= 2) {
    const req = buildBindingTeacherRequest(state.assemblies.slice(0, 2), {
      textSummary: input.textSummary,
      imageSummary: input.imageSummary,
      audioSummary: input.audioSummary,
    })
    bindingTeacherResult = await resolveBindingTeacher(req)
    if (state.assemblies.length >= 2) {
      state = applyCrossModalBridge(
        state,
        state.assemblies[0]!.id,
        state.assemblies[1]!.id,
        bindingTeacherResult,
        timestamp,
      )
    }
  }

  // 9. Recall
  let recallEvents: ActivationEvent[] = []
  if (newProtoMeanings.length > 0 && state.assemblies.length > 0) {
    const { state: afterRecall, recallEvents: re } = recallFromAssemblies(state, state.assemblies[0]!.id, timestamp)
    state = afterRecall
    recallEvents = re
  }

  // 10. Observe summary
  const activeParticles = state.particles.filter(p => p.activation > 0.1)
  const strongest = [...activeParticles]
    .sort((a, b) => b.activation - a.activation)
    .slice(0, 5)
    .map(p => ({ x: p.x, y: p.y, activation: p.activation }))

  const prevAssemblyIds = new Set(input.existingState?.assemblies.map(a => a.id) ?? [])
  const newlyDetectedAssemblies = state.assemblies.filter(a => !prevAssemblyIds.has(a.id)).map(a => a.id)

  const observe: SignalFieldObserveSummary = {
    particleCount: state.particles.length,
    activeParticleCount: activeParticles.length,
    strongestActivationRegions: strongest,
    assemblyCount: state.assemblies.length,
    newlyDetectedAssemblies,
    protoMeaningCount: state.protoMeanings.length,
    crossModalBridgeCount: state.crossModalBridges.length,
    recallEvents,
    bindingTeacherResult,
    frameCount: state.frameCount,
  }

  return { state, observe }
}
