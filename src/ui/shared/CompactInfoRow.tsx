/**
 * CompactInfoRow — displays a single label/value pair as a lightweight row.
 * Use this instead of a full card when the information is supplementary.
 *
 * Example:
 *   <CompactInfoRow label="保存状態" value="なし" />
 */
type CompactInfoRowProps = {
  label: string
  value: string
  valueClass?: string
}

export const CompactInfoRow = ({ label, value, valueClass = 'text-slate-700' }: CompactInfoRowProps) => (
  <div className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
    <span className="shrink-0 text-slate-500">{label}</span>
    <span className={`min-w-0 truncate text-right font-medium ${valueClass}`}>{value}</span>
  </div>
)
