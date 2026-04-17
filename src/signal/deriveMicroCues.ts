import type { MicroCue, SignalPacket } from './packetTypes'

type CueRule = {
  id: MicroCue['id']
  patterns: RegExp[]
  baseStrength: number
}

const CUE_RULES: CueRule[] = [
  { id: 'motivation_drop', patterns: [/意欲|やる気|気力/, /する気になれない/], baseStrength: 0.58 },
  { id: 'distress_cue', patterns: [/困|悩|つら|しんど|苦|疲/], baseStrength: 0.54 },
  { id: 'contrast_cue', patterns: [/けど|でも|一方|なのに|反面/], baseStrength: 0.42 },
  { id: 'monotony_cue', patterns: [/毎日同じ|繰り返し|単調|ルーチン/], baseStrength: 0.5 },
  { id: 'purpose_confusion_cue', patterns: [/何のため|意味が分から|目的が|なぜ働/], baseStrength: 0.56 },
  { id: 'guidance_request_cue', patterns: [/どうしたら|どうすれば|すべきか|教えて|ですか|ますか/], baseStrength: 0.52 },
  { id: 'change_option_cue', patterns: [/転職|辞め|やめ|変え|別の道|新しい方向|休む|相談/], baseStrength: 0.44 },
  { id: 'uncertainty_cue', patterns: [/なんとなく|かもしれない|迷|はっきりしない|言葉にできない/], baseStrength: 0.5 },
  { id: 'pressure_cue', patterns: [/急いで|早く|プレッシャー|押され|すぐ/], baseStrength: 0.46 },
  { id: 'faint_possibility_cue', patterns: [/少しだけ|希望|光|できるかも|まだ大丈夫/], baseStrength: 0.38 },
]

const clamp = (value: number) => Math.max(0, Math.min(1, value))

export const deriveMicroCues = (packets: SignalPacket[]): MicroCue[] => {
  return CUE_RULES
    .map((rule) => {
      const matchedPackets = packets.filter((packet) => rule.patterns.some((pattern) => pattern.test(packet.chunkText)))
      if (matchedPackets.length === 0) return undefined

      const maxCharge = Math.max(...matchedPackets.map((packet) => packet.emotionalCharge))
      const avgSalience = matchedPackets.reduce((total, packet) => total + packet.salience, 0) / matchedPackets.length
      const strength = clamp(rule.baseStrength + maxCharge * 0.22 + avgSalience * 0.12 - 0.08)

      return {
        id: rule.id,
        strength,
        reasons: matchedPackets.map((packet) => `${packet.id}:${packet.chunkText}`).slice(0, 3),
      }
    })
    .filter((cue): cue is MicroCue => Boolean(cue))
}
