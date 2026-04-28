type EvaluateSummary = {
  scenarioCount?: number
  ablationCount?: number
  lastResult?: string
}

type MobileEvaluatePanelsProps = {
  summary?: EvaluateSummary
}

export const MobileEvaluatePanels = ({ summary = {} }: MobileEvaluatePanelsProps) => (
  <div className="flex flex-col gap-4 px-3 py-4">
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Evaluate</p>
      <p className="mt-2 text-sm text-slate-400">
        Scenario / Ablation の結果サマリーが表示されます。
      </p>
    </div>
    {summary.lastResult ? (
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">最後の結果</p>
        <p className="mt-2 text-sm text-slate-300">{summary.lastResult}</p>
      </div>
    ) : null}
    <div className="grid grid-cols-2 gap-2">
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
        <p className="text-[10px] font-bold uppercase text-slate-500">Scenario</p>
        <p className="mt-1 text-2xl font-black text-white">{summary.scenarioCount ?? 0}</p>
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
        <p className="text-[10px] font-bold uppercase text-slate-500">Ablation</p>
        <p className="mt-1 text-2xl font-black text-white">{summary.ablationCount ?? 0}</p>
      </div>
    </div>
  </div>
)
