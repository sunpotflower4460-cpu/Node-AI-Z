import type { ChangeStatus, ProposedChange } from './types'

const STATUS_META: Record<ChangeStatus, { label: string; description: string; badgeClass: string; panelClass: string }> = {
  ephemeral: {
    label: '仮反映',
    description: '今回だけ薄く反映',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    panelClass: 'bg-slate-50 border-slate-200 text-slate-700',
  },
  provisional: {
    label: '様子見採用',
    description: '続ける前提でまだ観察中',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    panelClass: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  promoted: {
    label: '定着',
    description: '手応えがあり継続採用',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    panelClass: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  },
  reverted: {
    label: '差し戻し',
    description: '今回は戻して影響を停止',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    panelClass: 'bg-rose-50 border-rose-200 text-rose-900',
  },
}

const CHANGE_TARGET_LABELS: Record<string, string> = {
  over_explaining: '説明先行の傾き',
  certainty: '断定の強さ',
  gentleness: 'やわらかさ',
  overperformance: 'overperformance return 感度',
  ambiguity_overload: 'ambiguity return 感度',
  fragility: 'fragility return 感度',
  trust_drop: 'trust_drop return 感度',
  unarticulated_feeling: '未言語感覚の拾い上げ',
}

export const getRevisionStatusMeta = (status: ChangeStatus) => STATUS_META[status]

export const getRevisionKindLabel = (kind: ProposedChange['kind']) => {
  switch (kind) {
    case 'relation_weight':
      return 'Relation Path'
    case 'pattern_weight':
      return 'Pattern Boost'
    case 'home_trigger':
      return 'Home Trigger'
    case 'tone_bias':
      return 'Tone Bias'
  }
}

export const formatRevisionDelta = (delta: number) => `${delta > 0 ? '+' : ''}${delta.toFixed(2)}`

export const getProposedChangeTargetLabel = (change: ProposedChange) => {
  if (change.kind === 'relation_weight') {
    const [source, target] = change.key.split('->')
    return source && target ? `${source} → ${target} の経路` : change.key
  }

  return CHANGE_TARGET_LABELS[change.key] || change.key
}

export const describeProposedChange = (change: ProposedChange) => {
  const direction = change.delta >= 0 ? '少し強める' : '少し弱める'
  return `${getProposedChangeTargetLabel(change)}を${direction}`
}
