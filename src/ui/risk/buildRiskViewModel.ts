import type { SignalRiskReport } from '../../signalRisk/signalRiskTypes'
import { RISK_OVERALL_COPY } from '../copy/riskCopy'

export type RiskCardViewModel = {
  label: string
  score: number
  explanation: string
  level: 'low' | 'medium' | 'high'
  trend?: string
}

export type RiskViewModel = {
  overallLevel: 'low' | 'medium' | 'high'
  summaryText: string
  overbindingRisk: number
  falseBindingRisk: number
  teacherOvertrustRisk: number
  dreamNoiseRisk: number
  warnings: string[]
  recommendedActions: string[]
  cards: RiskCardViewModel[]
}

const toLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score >= 0.65) return 'high'
  if (score >= 0.35) return 'medium'
  return 'low'
}

const buildExplanation = (label: string, score: number): string => {
  const level = toLevel(score)
  if (label === 'Overbinding') {
    if (level === 'high') return 'bridge の増え方が多く、contrast 未整理の候補があります。'
    if (level === 'medium') return 'bridge の増え方がやや多く、contrast 未整理の候補があります。'
    return 'bridge の増え方は安定しています。'
  }
  if (label === 'False Binding') {
    if (level === 'high') return '誤った binding が残存している可能性が高い状態です。'
    if (level === 'medium') return '誤った binding が一部含まれている可能性があります。'
    return '誤った binding は少ない状態です。'
  }
  if (label === 'Teacher Overtrust') {
    if (level === 'high') return 'teacher 由来 bridge の一部が recall 成功前に強くなりすぎています。'
    if (level === 'medium') return 'teacher への依存がやや高い傾向があります。'
    return 'teacher 依存は適切な範囲内です。'
  }
  if (label === 'Dream Noise') {
    if (level === 'high') return 'dream tentative bridge が増えて、ノイズが多い状態です。'
    if (level === 'medium') return 'dream の bridge が若干多めです。'
    return 'dream ノイズは少ない状態です。'
  }
  return ''
}

const buildSummaryText = (report: SignalRiskReport): string => {
  return RISK_OVERALL_COPY[report.riskLevel].body
}

export const buildRiskViewModel = (report: SignalRiskReport): RiskViewModel => ({
  overallLevel: report.riskLevel,
  summaryText: buildSummaryText(report),
  overbindingRisk: report.overbindingRisk,
  falseBindingRisk: report.falseBindingRisk,
  teacherOvertrustRisk: report.teacherOvertrustRisk,
  dreamNoiseRisk: report.dreamNoiseRisk,
  warnings: report.warnings,
  recommendedActions: report.recommendedActions,
  cards: [
    {
      label: 'Overbinding',
      score: report.overbindingRisk,
      explanation: buildExplanation('Overbinding', report.overbindingRisk),
      level: toLevel(report.overbindingRisk),
    },
    {
      label: 'False Binding',
      score: report.falseBindingRisk,
      explanation: buildExplanation('False Binding', report.falseBindingRisk),
      level: toLevel(report.falseBindingRisk),
    },
    {
      label: 'Teacher Overtrust',
      score: report.teacherOvertrustRisk,
      explanation: buildExplanation('Teacher Overtrust', report.teacherOvertrustRisk),
      level: toLevel(report.teacherOvertrustRisk),
    },
    {
      label: 'Dream Noise',
      score: report.dreamNoiseRisk,
      explanation: buildExplanation('Dream Noise', report.dreamNoiseRisk),
      level: toLevel(report.dreamNoiseRisk),
    },
  ],
})

export const buildEmptyRiskViewModel = (): RiskViewModel => buildRiskViewModel({
  overbindingRisk: 0,
  falseBindingRisk: 0,
  teacherOvertrustRisk: 0,
  dreamNoiseRisk: 0,
  riskLevel: 'low',
  warnings: [],
  recommendedActions: [],
})
