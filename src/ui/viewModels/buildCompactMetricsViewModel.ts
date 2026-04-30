import type { CompactMetricItem } from '../shared/CompactMetricStrip'

type BuildCompactMetricsViewModelInput = {
  assemblyCount: number
  bridgeCount: number
  protoSeedCount: number
  recallSuccessRate: number
  averageTeacherDependency: number
}

const formatPercent = (value: number): string => `${Math.round(value * 100)}%`

export const buildCompactMetricsViewModel = ({
  assemblyCount,
  bridgeCount,
  protoSeedCount,
  recallSuccessRate,
  averageTeacherDependency,
}: BuildCompactMetricsViewModelInput): CompactMetricItem[] => [
  {
    id: 'assemblies',
    label: '成長した点群',
    researchLabel: 'Assemblies',
    value: assemblyCount,
    helper: '点群がまとまりとして認識され始めた数',
    status: assemblyCount === 0 ? 'empty' : 'good',
  },
  {
    id: 'bridges',
    label: '結びつき',
    researchLabel: 'Bridges',
    value: bridgeCount,
    helper: 'assemblies 間の結びつき',
    status: bridgeCount === 0 ? 'empty' : 'good',
  },
  {
    id: 'proto-seeds',
    label: '意味の種',
    researchLabel: 'Proto Seeds',
    value: protoSeedCount,
    helper: '意味未満の種として残った seed',
    status: protoSeedCount === 0 ? 'empty' : 'normal',
  },
  {
    id: 'recall',
    label: '想起',
    researchLabel: 'Recall',
    value: formatPercent(recallSuccessRate),
    helper: '自力想起の成功率',
    status: recallSuccessRate === 0 ? 'empty' : recallSuccessRate >= 0.5 ? 'good' : 'warning',
  },
  {
    id: 'teacher-dep',
    label: '先生依存',
    researchLabel: 'Teacher Dep.',
    value: formatPercent(averageTeacherDependency),
    helper: 'teacher への依存度',
    status:
      averageTeacherDependency === 0
        ? 'empty'
        : averageTeacherDependency < 0.5
          ? 'good'
          : 'warning',
  },
]
