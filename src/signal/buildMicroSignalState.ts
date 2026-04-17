import type { StateVector } from '../types/nodeStudio'
import type { MicroCue, MicroSignalState, SignalPacket } from './packetTypes'

type BuildMicroSignalStateInput = {
  packets: SignalPacket[]
  cues: MicroCue[]
  field?: StateVector
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))

const createBaseDimensions = (): MicroSignalState['dimensions'] => ({
  heaviness: 0.18,
  openness: 0.45,
  tension: 0.28,
  fragility: 0.24,
  urgency: 0.22,
  uncertainty: 0.28,
  answerPressure: 0.18,
  resonance: 0.3,
  agency: 0.4,
  drift: 0.2,
  clarity: 0.56,
  purposeCoherence: 0.54,
})

const applyCue = (
  dimensions: MicroSignalState['dimensions'],
  cue: MicroCue,
) => {
  const strength = cue.strength

  switch (cue.id) {
    case 'motivation_drop':
      dimensions.heaviness += strength * 0.22
      dimensions.agency -= strength * 0.18
      dimensions.drift += strength * 0.14
      dimensions.purposeCoherence -= strength * 0.12
      break
    case 'distress_cue':
      dimensions.heaviness += strength * 0.18
      dimensions.fragility += strength * 0.18
      dimensions.tension += strength * 0.12
      dimensions.urgency += strength * 0.08
      dimensions.openness -= strength * 0.1
      break
    case 'contrast_cue':
      dimensions.tension += strength * 0.16
      dimensions.uncertainty += strength * 0.1
      dimensions.clarity -= strength * 0.08
      break
    case 'monotony_cue':
      dimensions.heaviness += strength * 0.14
      dimensions.drift += strength * 0.16
      dimensions.resonance -= strength * 0.08
      dimensions.agency -= strength * 0.08
      break
    case 'purpose_confusion_cue':
      dimensions.uncertainty += strength * 0.18
      dimensions.drift += strength * 0.2
      dimensions.clarity -= strength * 0.18
      dimensions.purposeCoherence -= strength * 0.22
      break
    case 'guidance_request_cue':
      dimensions.answerPressure += strength * 0.22
      dimensions.openness += strength * 0.08
      dimensions.urgency += strength * 0.06
      break
    case 'change_option_cue':
      dimensions.openness += strength * 0.12
      dimensions.agency += strength * 0.08
      dimensions.tension += strength * 0.06
      break
    case 'uncertainty_cue':
      dimensions.uncertainty += strength * 0.18
      dimensions.drift += strength * 0.12
      dimensions.clarity -= strength * 0.16
      dimensions.agency -= strength * 0.06
      break
    case 'pressure_cue':
      dimensions.urgency += strength * 0.2
      dimensions.answerPressure += strength * 0.14
      dimensions.tension += strength * 0.1
      dimensions.openness -= strength * 0.08
      break
    case 'faint_possibility_cue':
      dimensions.resonance += strength * 0.18
      dimensions.agency += strength * 0.14
      dimensions.openness += strength * 0.1
      dimensions.clarity += strength * 0.08
      dimensions.purposeCoherence += strength * 0.08
      dimensions.heaviness -= strength * 0.08
      break
  }
}

const resolveFieldTone = (dimensions: MicroSignalState['dimensions']): MicroSignalState['fieldTone'] => {
  if (dimensions.heaviness >= 0.62 && dimensions.openness <= 0.42) {
    return 'low-band'
  }

  if (dimensions.openness >= 0.62 && dimensions.resonance >= 0.56 && dimensions.heaviness <= 0.48) {
    return 'high-band'
  }

  return 'mid-band'
}

export const buildMicroSignalState = ({
  packets,
  cues,
  field,
}: BuildMicroSignalStateInput): MicroSignalState => {
  const dimensions = createBaseDimensions()

  for (const cue of cues) {
    applyCue(dimensions, cue)
  }

  if (packets.length > 0) {
    const avgCharge = packets.reduce((total, packet) => total + packet.emotionalCharge, 0) / packets.length
    const avgSalience = packets.reduce((total, packet) => total + packet.salience, 0) / packets.length
    dimensions.heaviness += avgCharge * 0.12
    dimensions.fragility += avgCharge * 0.08
    dimensions.tension += avgCharge * 0.08
    dimensions.answerPressure += avgSalience * 0.06
    dimensions.clarity += avgSalience * 0.04
  }

  if (field) {
    dimensions.heaviness += field.heaviness * 0.12
    dimensions.fragility += field.fragility * 0.12
    dimensions.agency += field.agency * 0.1
    dimensions.openness += field.relation * 0.08
    dimensions.resonance += field.light * 0.08
    dimensions.clarity += (1 - field.ambiguity) * 0.08
    dimensions.purposeCoherence += field.self * 0.08
  }

  const normalized = Object.fromEntries(
    Object.entries(dimensions).map(([key, value]) => [key, clamp(value)]),
  ) as MicroSignalState['dimensions']

  return {
    packets,
    cues,
    dimensions: normalized,
    fieldTone: resolveFieldTone(normalized),
  }
}
