import type { Signal, SignalBinding, SignalBindingType, SignalField } from './types'

const BINDING_THRESHOLD = 0.4
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const resolveBindingType = (a: Signal, b: Signal): SignalBindingType => {
  // Internal ↔ internal: resonance
  if ((a.layer === 'self' || a.layer === 'belief') && (b.layer === 'self' || b.layer === 'belief')) {
    return 'resonance'
  }
  // External ↔ external: amplification
  if ((a.layer === 'other' || a.layer === 'field') && (b.layer === 'other' || b.layer === 'field')) {
    return 'amplification'
  }
  // self_exhaustion / self_limit + hope_signal → suppression
  if (
    (['self_exhaustion', 'self_limit'].includes(a.id) && b.id === 'hope_signal') ||
    (['self_exhaustion', 'self_limit'].includes(b.id) && a.id === 'hope_signal')
  ) {
    return 'suppression'
  }
  // Cross-layer default: tension
  return 'tension'
}

export const bindSignals = (field: SignalField): SignalBinding[] => {
  const bindings: SignalBinding[] = []
  const signals = field.signals.filter((s) => s.strength >= BINDING_THRESHOLD)

  for (let i = 0; i < signals.length; i++) {
    for (let j = i + 1; j < signals.length; j++) {
      const a = signals[i]
      const b = signals[j]

      // Only bind signals that appear together in at least one co-firing group
      const coFired = field.coFiringGroups.some(
        (group) => group.signalIds.includes(a.id) && group.signalIds.includes(b.id),
      )
      if (!coFired) continue

      const weight = clamp((a.strength + b.strength) / 2, 0, 0.99)
      const type = resolveBindingType(a, b)

      bindings.push({ sourceId: a.id, targetId: b.id, weight, type })
    }
  }

  return bindings.sort((a, b) => b.weight - a.weight)
}
