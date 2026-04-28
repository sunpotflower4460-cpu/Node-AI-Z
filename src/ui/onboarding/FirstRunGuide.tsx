import { useState } from 'react'
import { OnboardingFlow } from './OnboardingFlow'

const STORAGE_KEY = 'node-ai-z-onboarding-complete'

export const FirstRunGuide = () => {
  const [showOnboarding, setShowOnboarding] = useState(
    () => typeof window !== 'undefined' && !localStorage.getItem(STORAGE_KEY)
  )

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    setShowOnboarding(false)
  }

  if (!showOnboarding) return null

  return <OnboardingFlow onComplete={handleComplete} />
}
