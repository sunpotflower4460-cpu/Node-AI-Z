import type { BackgroundViewModel } from './buildBackgroundViewModel'

type OrganismStateCardProps = {
  organism: BackgroundViewModel['organism']
  /** When true, use compact Japanese labels */
  simpleView?: boolean
}

type StatRow = {
  en: string
  ja: string
  value: number
  colorClass: string
}

function Bar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100">
      <div
        className={`h-1.5 rounded-full ${colorClass}`}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  )
}

/**
 * Displays the persistent organism state for New Signal Mode.
 *
 * Note: This is not a claim of consciousness.
 * It is a continuity mechanism for pre-semantic signal learning.
 */
export const OrganismStateCard = ({ organism, simpleView = false }: OrganismStateCardProps) => {
  const rows: StatRow[] = [
    { en: 'Energy', ja: '活動量', value: organism.energy, colorClass: 'bg-amber-400' },
    { en: 'Curiosity', ja: '好奇心', value: organism.curiosity, colorClass: 'bg-cyan-400' },
    { en: 'Uncertainty', ja: '不確実性', value: organism.uncertainty, colorClass: 'bg-orange-400' },
    { en: 'Safety', ja: '安心度', value: organism.safety, colorClass: 'bg-emerald-400' },
    { en: 'Replay Pressure', ja: '再生圧', value: organism.replayPressure, colorClass: 'bg-violet-400' },
    { en: 'Teacher Dependency', ja: '先生依存', value: organism.teacherDependency, colorClass: 'bg-purple-400' },
    { en: 'Self Echo', ja: '残響', value: organism.selfEcho, colorClass: 'bg-blue-400' },
    { en: 'Internal Rhythm', ja: '内部リズム', value: organism.internalRhythm, colorClass: 'bg-indigo-400' },
  ]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {simpleView ? '内部状態' : 'Internal State'}
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
          {organism.regulationLabel}
        </span>
      </div>
      <div className="space-y-2">
        {rows.map(({ en, ja, value, colorClass }) => (
          <div key={en}>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-600">{simpleView ? ja : en}</span>
              <span className="font-mono text-slate-400">{(value * 100).toFixed(0)}%</span>
            </div>
            <Bar value={value} colorClass={colorClass} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-3 text-[10px] text-slate-400">
        <span>{simpleView ? '入力数' : 'Inputs'}: {organism.totalInputCount}</span>
        <span>{simpleView ? 'バックグラウンド' : 'BG ticks'}: {organism.backgroundTickCount}</span>
        <span>{simpleView ? '再生数' : 'Replays'}: {organism.totalReplayCount}</span>
      </div>
      <p className="mt-2 text-[9px] text-slate-300">
        {simpleView
          ? '内部状態は保存されています。これは意識の証明ではありません。'
          : 'persistent internal state · not a claim of consciousness'}
      </p>
    </div>
  )
}
