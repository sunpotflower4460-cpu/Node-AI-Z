import type { MicroCue } from './packetTypes'

type InhibitionRule = {
  source: string
  targets: string[]
  weight: number
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))

/**
 * Light-weight mutual inhibition between cues.
 *
 * Winner-take-all は避け、希望と疑念・規範の拮抗を少しだけ表面化させる。
 */
const INHIBITION_RULES: InhibitionRule[] = [
  {
    // faint possibility calms self-doubt / uncertainty a little
    source: 'faint_possibility_cue',
    targets: ['uncertainty_cue', 'motivation_drop', 'purpose_confusion_cue'],
    weight: 0.18,
  },
  {
    // pressure / normative pull suppresses hope a bit
    source: 'pressure_cue',
    targets: ['faint_possibility_cue', 'hope_signal'],
    weight: 0.22,
  },
  {
    // confusion dampens faint possibility slightly
    source: 'purpose_confusion_cue',
    targets: ['faint_possibility_cue'],
    weight: 0.14,
  },
]

export const applyCueInhibition = (
  cues: MicroCue[],
): { cues: MicroCue[]; debugNotes: string[] } => {
  const cueMap = new Map(cues.map((cue) => [cue.id, { ...cue }]))
  const debugNotes: string[] = []

  for (const rule of INHIBITION_RULES) {
    const source = cueMap.get(rule.source)
    if (!source || source.strength <= 0) continue

    for (const targetId of rule.targets) {
      const target = cueMap.get(targetId)
      if (!target || target.strength <= 0) continue

      const reduction = source.strength * rule.weight
      const nextStrength = clamp(target.strength * (1 - reduction))
      cueMap.set(targetId, { ...target, strength: nextStrength })
      debugNotes.push(
        `Inhibition: ${rule.source} dampened ${targetId} ${target.strength.toFixed(3)} → ${nextStrength.toFixed(3)}`,
      )
    }
  }

  if (debugNotes.length === 0) {
    debugNotes.push('Inhibition: no cue pairs triggered')
  }

  return { cues: [...cueMap.values()], debugNotes }
}
