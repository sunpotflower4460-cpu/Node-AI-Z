type ModalityRatioCardProps = {
  textRatio: number
  imageRatio: number
  audioRatio: number
  dominant: 'text' | 'image' | 'audio' | 'none'
  totalInputCount: number
}

const BAR_COLORS = {
  text: 'bg-rose-400',
  image: 'bg-sky-400',
  audio: 'bg-violet-400',
}

export const ModalityRatioCard = ({
  textRatio,
  imageRatio,
  audioRatio,
  dominant,
  totalInputCount,
}: ModalityRatioCardProps) => {
  const rows: { label: string; key: 'text' | 'image' | 'audio'; ratio: number }[] = [
    { label: 'テキスト', key: 'text', ratio: textRatio },
    { label: '画像', key: 'image', ratio: imageRatio },
    { label: '音声', key: 'audio', ratio: audioRatio },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">モダリティ比率</span>
        <span className="text-[11px] text-slate-400">{totalInputCount} 入力</span>
      </div>

      <div className="space-y-2">
        {rows.map(({ label, key, ratio }) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className={`w-10 text-right text-[11px] font-semibold ${
                dominant === key ? 'text-slate-700' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
            <div className="flex-1 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full transition-all ${BAR_COLORS[key]}`}
                style={{ width: `${Math.round(ratio * 100)}%` }}
              />
            </div>
            <span className="w-8 text-right text-[11px] text-slate-400">
              {(ratio * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>

      {dominant !== 'none' && (
        <p className="mt-2 text-[11px] text-slate-400">
          主要モダリティ:{' '}
          <span className="font-semibold text-slate-600">
            {dominant === 'text' ? 'テキスト' : dominant === 'image' ? '画像' : '音声'}
          </span>
        </p>
      )}
    </div>
  )
}
