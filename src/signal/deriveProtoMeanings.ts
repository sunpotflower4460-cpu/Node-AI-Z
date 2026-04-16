import type { Signal, SignalField, ProtoMeaning, ProtoMeaningTexture } from './types'

type TextureRule = {
  requiredSignals: string[]
  texture: ProtoMeaningTexture
  valenceDelta: number
}

const TEXTURE_RULES: TextureRule[] = [
  { requiredSignals: ['self_exhaustion', 'self_limit'], texture: 'heavy', valenceDelta: -0.3 },
  { requiredSignals: ['self_trust', 'fear_signal'], texture: 'conflicted', valenceDelta: -0.1 },
  { requiredSignals: ['self_trust', 'self_doubt'], texture: 'fragile', valenceDelta: -0.2 },
  { requiredSignals: ['pre_verbal', 'ambient_unease'], texture: 'ambiguous', valenceDelta: -0.1 },
  { requiredSignals: ['hope_signal', 'fear_signal'], texture: 'searching', valenceDelta: 0 },
  { requiredSignals: ['hope_signal'], texture: 'hopeful', valenceDelta: 0.3 },
  { requiredSignals: ['boundary_awareness', 'relational_friction'], texture: 'closed', valenceDelta: -0.2 },
  { requiredSignals: ['bare_signal', 'pre_verbal'], texture: 'still', valenceDelta: 0 },
  { requiredSignals: ['change_signal', 'meaning_seeking'], texture: 'open', valenceDelta: 0.1 },
]

const generateId = (index: number) => `pm_${index}_${Date.now().toString(36)}`
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

const inferTexture = (signals: Signal[], valence: number): ProtoMeaningTexture => {
  if (valence < -0.4) return 'heavy'
  if (valence > 0.3) return 'hopeful'
  const hasPreVerbal = signals.some((s) => s.id === 'pre_verbal' || s.id === 'ambient_unease')
  if (hasPreVerbal) return 'ambiguous'
  const hasConflict = signals.some((s) => s.id === 'fear_signal') && signals.some((s) => s.id === 'hope_signal')
  if (hasConflict) return 'conflicted'
  if (valence < -0.1) return 'fragile'
  return 'searching'
}

export const deriveProtoMeanings = (field: SignalField, stimulusValence: number): ProtoMeaning[] => {
  const protoMeanings: ProtoMeaning[] = []
  const usedGroups = new Set<string>()

  // Rule-based proto-meanings from texture rules
  for (const rule of TEXTURE_RULES) {
    const matchedSignals = field.signals.filter((s) => rule.requiredSignals.includes(s.id))
    if (matchedSignals.length < rule.requiredSignals.length) continue

    const groupKey = rule.requiredSignals.sort().join('+')
    if (usedGroups.has(groupKey)) continue
    usedGroups.add(groupKey)

    const weight = clamp(
      matchedSignals.reduce((sum, s) => sum + s.strength, 0) / matchedSignals.length,
      0,
      0.99,
    )
    const valence = clamp(stimulusValence + rule.valenceDelta, -1, 1)

    protoMeanings.push({
      id: generateId(protoMeanings.length),
      cluster: matchedSignals.map((s) => s.label),
      weight,
      valence,
      texture: rule.texture,
    })
  }

  // Fallback: one proto-meaning from the strongest co-firing group
  if (protoMeanings.length === 0) {
    const strongestGroup = [...field.coFiringGroups].sort((a, b) => b.cohesion - a.cohesion)[0]
    const groupSignals = strongestGroup
      ? field.signals.filter((s) => strongestGroup.signalIds.includes(s.id))
      : field.signals.slice(0, 2)

    const weight = groupSignals.length > 0
      ? clamp(groupSignals.reduce((sum, s) => sum + s.strength, 0) / groupSignals.length, 0, 0.99)
      : 0.3
    const texture = inferTexture(groupSignals, stimulusValence)

    protoMeanings.push({
      id: generateId(0),
      cluster: groupSignals.map((s) => s.label),
      weight,
      valence: clamp(stimulusValence, -1, 1),
      texture,
    })
  }

  return protoMeanings.sort((a, b) => b.weight - a.weight)
}
