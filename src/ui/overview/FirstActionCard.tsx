import { Activity, RefreshCw, Terminal } from 'lucide-react'
import { useState } from 'react'
import { Search } from 'lucide-react'

const SAMPLE_INPUTS = [
  '仕事に対する意欲が湧かなくて、転職すべきか悩んでいる',
  '最近ずっと、自分のことを信じきれない',
  'なんとなく引っかかるけど、まだ言葉にできない',
  'ただ分かってほしいだけなのかもしれない',
  '少しだけ希望はある気がする',
]

const MAX_SAMPLE_PREVIEW_LENGTH = 20

type FirstActionCardProps = {
  inputText: string
  isAnalyzing: boolean
  onInputChange: (text: string) => void
  onAnalyze: () => void
  onSampleClick: (text: string) => void
}

export const FirstActionCard = ({
  inputText,
  isAnalyzing,
  onInputChange,
  onAnalyze,
  onSampleClick,
}: FirstActionCardProps) => {
  const [isSamplesOpen, setIsSamplesOpen] = useState(false)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <p className="mb-3 text-sm font-bold text-slate-700">まず1回観察する</p>
      <p className="mb-4 text-xs leading-relaxed text-slate-500">
        テキストを入力して Analyze すると、Signal Mode の発火・成長・リスクが表示されます。
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={inputText}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="テキストを入力して内部パイプラインを観察する..."
            aria-label="観察対象のテキスト"
            inputMode="text"
            enterKeyHint="search"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-base font-medium text-slate-800 transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 md:py-3.5 md:text-[15px]"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onAnalyze()
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isAnalyzing || !inputText.trim()}
          aria-label={isAnalyzing ? '分析中' : '分析する'}
          className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 sm:w-auto"
        >
          {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
          Analyze
        </button>
      </div>
      <div className="mt-3">
        <button
          type="button"
          onClick={() => setIsSamplesOpen((previous) => !previous)}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400"
        >
          <Terminal className="h-3.5 w-3.5" />
          サンプル
          <span className="text-[9px]">{isSamplesOpen ? '▲' : '▼'}</span>
        </button>
        {isSamplesOpen ? (
          <div className="scrollbar-hide mt-2 -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
            {SAMPLE_INPUTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => onSampleClick(sample)}
                className="shrink-0 rounded-lg border border-slate-200/60 bg-slate-100 px-3.5 py-2.5 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 active:scale-[0.98]"
              >
                {sample.length > MAX_SAMPLE_PREVIEW_LENGTH ? `${sample.substring(0, MAX_SAMPLE_PREVIEW_LENGTH)}...` : sample}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
