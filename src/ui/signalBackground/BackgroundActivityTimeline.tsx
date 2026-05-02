import type { BackgroundActivityEntry } from '../../signalBackground/signalBackgroundTypes'

type BackgroundActivityTimelineProps = {
  entries: BackgroundActivityEntry[]
  maxEntries?: number
  simpleView?: boolean
}

const cycleColors: Record<BackgroundActivityEntry['cycleType'], string> = {
  micro_pulse: 'bg-blue-300',
  weak_replay: 'bg-violet-400',
  maintenance: 'bg-amber-400',
  snapshot_saved: 'bg-emerald-400',
}

const cycleLabels: Record<BackgroundActivityEntry['cycleType'], { en: string; ja: string }> = {
  micro_pulse: { en: 'micro pulse', ja: 'マイクロ発火' },
  weak_replay: { en: 'weak replay', ja: '弱い再生' },
  maintenance: { en: 'maintenance', ja: 'メンテナンス' },
  snapshot_saved: { en: 'snapshot saved', ja: 'スナップショット保存' },
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

/**
 * Displays a lightweight timeline of recent background activity for New Signal Mode.
 */
export const BackgroundActivityTimeline = ({
  entries,
  maxEntries = 10,
  simpleView = false,
}: BackgroundActivityTimelineProps) => {
  const visible = [...entries].reverse().slice(0, maxEntries)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
        {simpleView ? '活動履歴' : 'Background Activity'}
      </h3>
      {visible.length === 0 ? (
        <p className="text-[11px] text-slate-400">
          {simpleView ? 'まだ活動なし' : 'No activity yet'}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {visible.map((entry, i) => {
            const dot = cycleColors[entry.cycleType] ?? 'bg-slate-300'
            const label = cycleLabels[entry.cycleType] ?? { en: entry.cycleType, ja: entry.cycleType }
            return (
              <li key={i} className="flex items-start gap-2 text-[11px]">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dot}`} />
                <span className="font-mono text-slate-400">{formatTime(entry.timestamp)}</span>
                <span className="text-slate-600">{simpleView ? label.ja : label.en}</span>
                {entry.note && (
                  <span className="truncate text-slate-400">{entry.note}</span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
