import type { ParticleStimulus } from '../signalField/signalFieldTypes'

export const createTextParticleStimulus = (
  text: string,
  timestamp = Date.now(),
): ParticleStimulus => ({
  modality: 'text',
  vector: [
    Math.min(1, text.length / 100),
    text.includes('?') ? 1 : 0,
    text.includes('!') ? 0.8 : 0,
    (text.trim().split(/\s+/).filter(Boolean).length % 10) / 10,
    Array.from(text).slice(0, 8).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 128 / 128,
  ],
  strength: Math.min(1, Math.max(0.2, text.length / 200)),
  timestamp,
})
