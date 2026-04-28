export type OnboardingStep = {
  id: string
  title: string
  description: string
  highlight?: string
}

export type OnboardingViewModel = {
  steps: OnboardingStep[]
  totalSteps: number
}

export const buildOnboardingViewModel = (): OnboardingViewModel => {
  const steps: OnboardingStep[] = [
    {
      id: 'what',
      title: 'Node-AI-Z とは',
      description:
        'Node-AI-Z は、CPU だけで育つ知性の実験アプリです。外部 LLM に頼らず、点群の発火・結合・想起から学習します。',
      highlight: 'overview',
    },
    {
      id: 'modes',
      title: '3 つのモード',
      description:
        'New Signal Mode（主役）、Crystallized Legacy（旧系統比較）、LLM Mode（外部API比較）の 3 つがあります。まずは New Signal Mode を使いましょう。',
      highlight: 'mode-selector',
    },
    {
      id: 'signal',
      title: 'New Signal Mode の見方',
      description:
        '最初から意味ノードを持ちません。点群（particles）が発火し、繰り返すうちに assembly（発火群）と bridge（結合）が育ちます。',
      highlight: 'field',
    },
    {
      id: 'stage',
      title: 'Stage と Teacher Dependency',
      description:
        'Stage は発達段階（1〜8）です。最初は Teacher に補助されますが、成長とともに teacher dependency が下がり、自律した想起ができるようになります。',
      highlight: 'growth',
    },
    {
      id: 'start',
      title: 'まず見るおすすめ画面',
      description:
        'Overview で現在地を確認 → Field で発火を観察 → Growth で assembly/bridge の成長 → Teacher で依存度の変化、を順に見ると分かりやすいです。',
      highlight: 'overview',
    },
  ]

  return { steps, totalSteps: steps.length }
}
