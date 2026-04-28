import type { SignalScenario } from './signalScenarioTypes'

export function createSameObjectLearningScenario(repeat = 3): SignalScenario {
  return {
    id: 'same_object_learning',
    name: 'Same Object Learning',
    description: 'Show the same text/image pair multiple times to verify assembly strengthening',
    steps: Array.from({ length: repeat }, (_, i) => ({
      id: `step_${i}`,
      inputType: 'text' as const,
      payload: { text: 'repeating concept', image: 'matching visual' },
      repeat: 1,
      expectedEffect: 'assembly_strengthened',
    })),
  }
}

export function createSimilarButDifferentScenario(): SignalScenario {
  return {
    id: 'similar_but_different',
    name: 'Similar But Different',
    description: 'Mix similar but distinct inputs to verify contrast learning',
    steps: [
      { id: 'step_0', inputType: 'text', payload: { text: 'concept A' }, expectedEffect: 'assembly_created' },
      { id: 'step_1', inputType: 'text', payload: { text: 'concept B similar' }, expectedEffect: 'contrast_recorded' },
      { id: 'step_2', inputType: 'text', payload: { text: 'concept A again' }, expectedEffect: 'assembly_strengthened' },
    ],
  }
}

export function createTeacherToTeacherFreeScenario(): SignalScenario {
  return {
    id: 'teacher_to_teacher_free',
    name: 'Teacher-Assisted to Teacher-Free',
    description: 'Start with teacher, then test self-recall without teacher',
    steps: [
      { id: 'step_0', inputType: 'teacher_hint', payload: { text: 'guided concept' }, expectedEffect: 'bridge_created' },
      { id: 'step_1', inputType: 'teacher_hint', payload: { text: 'guided concept' }, expectedEffect: 'bridge_reinforced' },
      { id: 'step_2', inputType: 'text', payload: { text: 'guided concept' }, expectedEffect: 'self_recall' },
    ],
  }
}

export function createOverbindingStressScenario(count = 5): SignalScenario {
  return {
    id: 'overbinding_stress',
    name: 'Overbinding Stress Test',
    description: 'Feed many similar inputs to test overbinding detection',
    steps: Array.from({ length: count }, (_, i) => ({
      id: `step_${i}`,
      inputType: 'text' as const,
      payload: { text: `similar concept variant ${i}` },
      expectedEffect: 'overbinding_risk_checked',
    })),
  }
}

export function createRestConsolidationScenario(): SignalScenario {
  return {
    id: 'rest_consolidation',
    name: 'Rest Consolidation',
    description: 'Input followed by rest step to verify replay/consolidation',
    steps: [
      { id: 'step_0', inputType: 'text', payload: { text: 'concept to consolidate' }, expectedEffect: 'assembly_created' },
      { id: 'step_1', inputType: 'rest', expectedEffect: 'consolidation_run' },
      { id: 'step_2', inputType: 'text', payload: { text: 'concept to consolidate' }, expectedEffect: 'assembly_strengthened' },
    ],
  }
}
