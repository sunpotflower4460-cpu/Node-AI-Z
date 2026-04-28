export const SignalFieldVisualTheme = {
  background: '#020617', // slate-950
  particle: {
    inactive: { color: '#1e293b', opacity: 0.4 },
    external: { color: '#e0f2fe', glowColor: '#bae6fd' },
    internal: { color: '#3b82f6', glowColor: '#60a5fa' },
    teacher: { color: '#a855f7', glowColor: '#c084fc' },
    replay: { color: '#60a5fa', glowColor: '#93c5fd', opacityMod: 0.7 },
    riskCandidate: { color: '#ef4444', glowColor: '#f87171' },
    default: { color: '#475569', glowColor: '#64748b' },
  },
  bridge: {
    tentative: { color: '#475569', label: 'Tentative' },
    reinforced: { color: '#818cf8', label: 'Reinforced' },
    teacher_light: { color: '#a855f7', label: 'Teacher Light' },
    teacher_free: { color: '#22c55e', label: 'Teacher Free' },
    promoted: { color: '#4ade80', label: 'Promoted' },
  },
  risk: {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
  },
  stage: {
    1: { color: '#64748b', label: 'Ignition' },
    2: { color: '#6366f1', label: 'Assembly' },
    3: { color: '#a855f7', label: 'Teacher Binding' },
    4: { color: '#06b6d4', label: 'Self Recall' },
    5: { color: '#10b981', label: 'Contrast Learning' },
    6: { color: '#f59e0b', label: 'Sequence Memory' },
    7: { color: '#f97316', label: 'Action Loop' },
    8: { color: '#eab308', label: 'Mother Ready' },
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#475569',
    accent: '#22d3ee',
  },
  card: {
    background: '#0f172a',
    border: '#1e293b',
    glow: 'rgba(99, 102, 241, 0.1)',
  },
} as const

export type BridgeStage = keyof typeof SignalFieldVisualTheme.bridge
export type RiskLevel = keyof typeof SignalFieldVisualTheme.risk
