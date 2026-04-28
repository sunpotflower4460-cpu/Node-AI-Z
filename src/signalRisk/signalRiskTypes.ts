export type SignalRiskReport = {
  overbindingRisk: number
  falseBindingRisk: number
  teacherOvertrustRisk: number
  dreamNoiseRisk: number
  riskLevel: 'low' | 'medium' | 'high'
  warnings: string[]
  recommendedActions: string[]
}
