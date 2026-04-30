import { Sparkles } from 'lucide-react'

export const EmptyObservationState = () => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400">
        <Sparkles className="h-6 w-6" />
      </div>
      <div>
        <p className="text-base font-bold text-slate-700">まだ観察結果はありません</p>
        <p className="mt-1 text-sm text-slate-500">最初の Analyze で作られるもの:</p>
      </div>
      <ol className="space-y-2 text-left text-sm text-slate-600">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">1</span>
          発火した点群
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">2</span>
          assembly 候補
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">3</span>
          現在の stage
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">4</span>
          risk の初期値
        </li>
      </ol>
    </div>
  </section>
)
