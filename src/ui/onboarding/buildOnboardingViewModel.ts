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
        'Node-AI-Z は、入力に対して内部でどんな発火や結びつきが起きるかを観察する実験アプリです。',
      highlight: 'overview',
    },
    {
      id: 'modes',
      title: '2 つの使い方',
      description:
        '観察モードでは内部を見ます。体験モードでは自然に話します。まずは観察モードから始めましょう。',
      highlight: 'mode-selector',
    },
    {
      id: 'signal',
      title: '新しい信号モード',
      description:
        '新しい信号モードは、最初から意味を入れず、点群の発火と結びつきから育つモードです。',
      highlight: 'field',
    },
    {
      id: 'start',
      title: 'まずやること',
      description:
        'まず短い文章を入力して Analyze してください。発火・成長・リスクが表示されます。',
      highlight: 'overview',
    },
    {
      id: 'inspect',
      title: '結果を見る',
      description:
        '結果が出たら、「発火」「成長」「リスク」タブを見ると、裏側で何が起きたか分かります。',
      highlight: 'growth',
    },
  ]

  return { steps, totalSteps: steps.length }
}
