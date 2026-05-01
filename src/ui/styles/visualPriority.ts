/**
 * Visual priority levels for UI elements.
 * Use these constants to ensure consistent visual hierarchy across the app.
 */
export const VISUAL_PRIORITY = {
  /** 重要・主導線: AnalyzeFlowCard / CurrentSummaryCard */
  primary: 'primary',
  /** 補助情報: DevelopmentStageCard / RiskSummaryCard */
  secondary: 'secondary',
  /** 詳細・研究情報: raw metrics / IDs / logs */
  tertiary: 'tertiary',
  /** 注意: risk high / destructive actions */
  warning: 'warning',
} as const

export type VisualPriority = (typeof VISUAL_PRIORITY)[keyof typeof VISUAL_PRIORITY]

/** Tailwind classes by visual priority level */
export const VISUAL_PRIORITY_CLASS: Record<VisualPriority, string> = {
  primary: 'border-slate-700 bg-slate-900 text-white',
  secondary: 'border-slate-200 bg-white text-slate-800',
  tertiary: 'border-slate-100 bg-slate-50 text-slate-600',
  warning: 'border-amber-300 bg-amber-50 text-amber-900',
}
