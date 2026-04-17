export type SignalPacket = {
  id: string
  source: 'user_input' | 'memory' | 'prediction' | 'persona' | 'external'
  chunkText: string
  salience: number
  emotionalCharge: number
  route: string[]
}

export type MicroCue = {
  id: string
  strength: number
  reasons: string[]
}

export type MicroSignalState = {
  packets: SignalPacket[]
  cues: MicroCue[]
  dimensions: {
    heaviness: number
    openness: number
    tension: number
    fragility: number
    urgency: number
    uncertainty: number
    answerPressure: number
    resonance: number
    agency: number
    drift: number
    clarity: number
    purposeCoherence: number
  }
  fieldTone: 'low-band' | 'mid-band' | 'high-band'
}
