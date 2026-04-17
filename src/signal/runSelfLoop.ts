import type { Signal, SelfLoopState } from './types'

const SELF_LAYERS = new Set<Signal['layer']>(['self', 'belief'])
const LOOP_ITERATIONS = 2
const REINFORCEMENT_RATE = 0.08
const MAX_SIGNAL_STRENGTH = 0.99
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const reinforce = (signal: Signal, coActivated: Signal[]): Signal => {
  const boost = coActivated.reduce((sum, s) => sum + s.strength * REINFORCEMENT_RATE, 0)
  return { ...signal, strength: clamp(signal.strength + boost, 0, MAX_SIGNAL_STRENGTH) }
}

export const runSelfLoop = (signals: Signal[]): SelfLoopState => {
  const internalSignals = signals.filter((s) => SELF_LAYERS.has(s.layer))
  const notes: string[] = []

  let current = [...internalSignals]

  for (let iteration = 0; iteration < LOOP_ITERATIONS; iteration++) {
    current = current.map((signal) => {
      const coActivated = current.filter((s) => s.id !== signal.id)
      return reinforce(signal, coActivated)
    })
    notes.push(`Loop ${iteration + 1}: ${current.map((s) => `${s.label}(${s.strength.toFixed(2)})`).join(', ')}`)
  }

  const dominantSignals = current
    .filter((s) => s.strength >= 0.5)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)

  const resonanceScore =
    dominantSignals.length > 0
      ? clamp(dominantSignals.reduce((sum, s) => sum + s.strength, 0) / dominantSignals.length, 0, 1)
      : 0

  return {
    dominantSignals,
    loopCount: LOOP_ITERATIONS,
    resonanceScore,
  }
}
