type OnboardingSpotlightProps = {
  targetId: string
  label: string
}

export const OnboardingSpotlight = ({ targetId, label }: OnboardingSpotlightProps) => (
  <div
    className="pointer-events-none absolute inset-0 z-50 rounded-2xl ring-2 ring-cyan-400/70 ring-offset-2 ring-offset-slate-950"
    data-spotlight-target={targetId}
    aria-label={label}
  />
)
