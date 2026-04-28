import type { AblationFeatureEntry } from './buildAblationViewModel'

type AblationFeatureToggleListProps = {
  features: AblationFeatureEntry[]
  onToggle: (key: string, enabled: boolean) => void
}

export const AblationFeatureToggleList = ({ features, onToggle }: AblationFeatureToggleListProps) => (
  <div className="space-y-2">
    {features.map((feature) => (
      <label
        key={feature.key}
        className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition-colors hover:border-indigo-200"
      >
        <div>
          <p className="text-xs font-semibold text-slate-800">{feature.label}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">{feature.description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={feature.enabled}
          onClick={() => onToggle(feature.key, !feature.enabled)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
            feature.enabled ? 'bg-indigo-600' : 'bg-slate-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition-transform ${
              feature.enabled ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </label>
    ))}
  </div>
)
