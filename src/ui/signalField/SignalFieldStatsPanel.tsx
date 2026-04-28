import type { SignalFieldViewModel } from './buildSignalFieldViewModel'

type SignalFieldStatsPanelProps = {
  summary: SignalFieldViewModel['summary']
}

type StatItem = {
  label: string
  value: number
  colorClass?: string
}

export const SignalFieldStatsPanel = ({ summary }: SignalFieldStatsPanelProps) => {
  const stats: StatItem[] = [
    { label: 'Particles', value: summary.particleCount },
    { label: 'Active Particles', value: summary.activeParticleCount, colorClass: 'text-cyan-600' },
    { label: 'Assemblies', value: summary.assemblyCount, colorClass: 'text-indigo-600' },
    { label: 'Bridges', value: summary.bridgeCount, colorClass: 'text-violet-600' },
    { label: 'Replay Count', value: summary.replayCount, colorClass: 'text-blue-600' },
    { label: 'Teacher-Assisted', value: summary.teacherAssistedBridgeCount, colorClass: 'text-purple-600' },
    { label: 'Teacher-Free', value: summary.teacherFreeBridgeCount, colorClass: 'text-emerald-600' },
  ]

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {stats.map(({ label, value, colorClass = 'text-slate-800' }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
          <p className={`mt-1.5 text-2xl font-black ${colorClass}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
