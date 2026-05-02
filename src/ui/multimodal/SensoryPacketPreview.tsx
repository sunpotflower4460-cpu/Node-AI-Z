import type { SensoryPacketSummary } from '../../signalSensory/buildSensoryPacketSummary'

type SensoryPacketPreviewProps = {
  summary: SensoryPacketSummary
}

const MODALITY_COLORS: Record<string, string> = {
  text: 'bg-rose-50 border-rose-200 text-rose-700',
  image: 'bg-sky-50 border-sky-200 text-sky-700',
  audio: 'bg-violet-50 border-violet-200 text-violet-700',
  audio_mock: 'bg-slate-50 border-slate-200 text-slate-500',
}

export const SensoryPacketPreview = ({ summary }: SensoryPacketPreviewProps) => {
  const colorClass =
    MODALITY_COLORS[summary.isMock ? 'audio_mock' : summary.modality] ??
    MODALITY_COLORS['text']!

  return (
    <div className={`rounded-2xl border p-3 ${colorClass}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider">{summary.modality}</span>
        {summary.isMock && (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            mock
          </span>
        )}
      </div>

      <p className="truncate text-[11px] leading-relaxed opacity-80">{summary.description}</p>

      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <span className="text-slate-500">特徴数</span>
        <span className="font-semibold">{summary.featureCount}</span>

        <span className="text-slate-500">平均値</span>
        <span className="font-semibold">{summary.meanFeatureValue.toFixed(3)}</span>

        <span className="text-slate-500">最大特徴</span>
        <span className="truncate font-semibold">{summary.topFeatureName}</span>

        <span className="text-slate-500">確信度</span>
        <span className="font-semibold">{(summary.extractionConfidence * 100).toFixed(0)}%</span>
      </div>

      {/* Mini feature bar */}
      <div className="mt-3 flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
        {Array.from({ length: summary.featureCount }, (_, i) => (
          <div
            key={i}
            className="flex-1 rounded-full bg-current opacity-60"
            style={{
              opacity: i === summary.topFeatureIndex ? 1 : 0.35,
            }}
          />
        ))}
      </div>

      {summary.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {summary.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
