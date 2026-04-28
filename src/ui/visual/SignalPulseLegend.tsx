import { SignalFieldVisualTheme } from './SignalFieldVisualTheme'

export const SignalPulseLegend = () => (
  <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-400">
    {[
      { color: SignalFieldVisualTheme.particle.external.color, label: 'External' },
      { color: SignalFieldVisualTheme.particle.internal.color, label: 'Internal' },
      { color: SignalFieldVisualTheme.particle.teacher.color, label: 'Teacher' },
      { color: SignalFieldVisualTheme.particle.replay.color, label: 'Replay' },
      { color: SignalFieldVisualTheme.particle.riskCandidate.color, label: 'Risk' },
    ].map(({ color, label }) => (
      <span key={label} className="flex items-center gap-1.5">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
        />
        {label}
      </span>
    ))}
  </div>
)
