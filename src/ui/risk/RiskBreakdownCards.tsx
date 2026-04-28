import type { RiskCardViewModel } from './buildRiskViewModel'

type RiskBreakdownCardsProps = {
  cards: RiskCardViewModel[]
}

const CARD_STYLES = {
  low: 'border-slate-200 bg-white text-slate-600',
  medium: 'border-amber-200 bg-amber-50/70 text-amber-700',
  high: 'border-red-200 bg-red-50/70 text-red-700',
}

const SCORE_STYLES = {
  low: 'text-slate-700',
  medium: 'text-amber-800',
  high: 'text-red-800',
}

export const RiskBreakdownCards = ({ cards }: RiskBreakdownCardsProps) => (
  <div className="grid gap-3 sm:grid-cols-2">
    {cards.map((card) => (
      <div key={card.label} className={`rounded-2xl border p-4 shadow-sm ${CARD_STYLES[card.level]}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{card.label}</p>
            <p className={`mt-1 text-2xl font-black ${SCORE_STYLES[card.level]}`}>
              {card.score.toFixed(2)}
            </p>
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
            card.level === 'high'
              ? 'border-red-200 bg-red-100 text-red-700'
              : card.level === 'medium'
                ? 'border-amber-200 bg-amber-100 text-amber-700'
                : 'border-slate-200 bg-slate-100 text-slate-500'
          }`}>
            {card.level}
          </span>
        </div>
        <p className="mt-2 text-xs font-medium leading-relaxed opacity-80">{card.explanation}</p>
        {card.trend ? (
          <p className="mt-2 text-[11px] font-semibold opacity-60">trend: {card.trend}</p>
        ) : null}
      </div>
    ))}
  </div>
)
