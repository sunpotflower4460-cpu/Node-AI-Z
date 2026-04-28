import { ArrowRightCircle } from 'lucide-react'

type NextActionCardProps = {
  nextActions: string[]
}

export const NextActionCard = ({ nextActions }: NextActionCardProps) => (
  <section className="rounded-[28px] border border-slate-800 bg-slate-950/90 p-5 shadow-[0_18px_50px_-30px_rgba(16,185,129,0.28)]">
    <div className="flex items-center gap-2">
      <ArrowRightCircle className="h-5 w-5 text-emerald-300" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Next Action</p>
        <p className="mt-1 text-sm text-slate-300">次に見るとよいこと</p>
      </div>
    </div>
    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-200">
      {nextActions.map((action) => (
        <li key={action} className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">{action}</li>
      ))}
    </ul>
  </section>
)
