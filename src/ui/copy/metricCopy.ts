import type { MetricEntry } from './uiCopyTypes'

export type MetricId =
  | 'assemblies'
  | 'bridges'
  | 'protoSeeds'
  | 'recallSuccess'
  | 'teacherDependency'
  | 'promotionReady'

export const METRIC_COPY: Record<MetricId, MetricEntry> = {
  assemblies: {
    simpleLabel: '成長した点群',
    researchLabel: 'Assemblies',
    description: '何度も似た形で発火して、まとまりとして記録されたもの。',
  },
  bridges: {
    simpleLabel: '結びつき',
    researchLabel: 'Bridges',
    description: '点群同士のあいだにできた再利用できる橋。',
  },
  protoSeeds: {
    simpleLabel: '意味の種',
    researchLabel: 'Proto Seeds',
    description: 'まだ確定した意味ではないが、意味になりそうな安定したまとまり。',
  },
  recallSuccess: {
    simpleLabel: '想起成功',
    researchLabel: 'Recall Success',
    description: '先生なしで正しく思い出せた割合。',
  },
  teacherDependency: {
    simpleLabel: '先生への依存',
    researchLabel: 'Teacher Dependency',
    description: '先生なしで想起できるかどうかの指標。値が低いほど自立している。',
  },
  promotionReady: {
    simpleLabel: '昇格候補',
    researchLabel: 'Promotion Ready',
    description: '安定した発火パターンが記録され、次の段階への準備が整ったもの。',
  },
}

export const getMetricCopy = (id: MetricId): MetricEntry => METRIC_COPY[id]

export const getMetricLabel = (id: MetricId, mode: 'simple' | 'research'): string => {
  const entry = METRIC_COPY[id]
  if (mode === 'research') return `${entry.simpleLabel} ${entry.researchLabel}`
  return entry.simpleLabel
}
