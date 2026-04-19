# Phase 1: Session Continuity Implementation

## Overview

This phase introduces **session brain state continuity** to the crystallized thinking runtime. The system now maintains internal state across turns, transforming from a stateless processor into a living system with temporal memory.

## Key Concept

Before Phase 1:
```
Input → Processing → Output
```

After Phase 1:
```
Previous State → Input touches state → Processing → Next State
```

Each turn now carries residual signals from previous turns, creating temporal continuity.

## Implementation Files

### Core Brain State

- **`src/brain/sessionBrainState.ts`**: Type definitions for session state
  - `SessionBrainState`: Main state type with all session variables
  - `EpisodicBufferEntry`: Placeholder for future episodic memory
  - `WorkspaceState`: Simplified workspace (Phase 1)
  - `InteroceptiveState`: Simplified interoception (Phase 1)
  - `MicroSignalDimensions`: Tracking micro-signal state

- **`src/brain/createInitialBrainState.ts`**: Initial state factory
  - Creates fresh state for new sessions
  - Provides sensible defaults for all fields
  - Generates unique session IDs

- **`src/brain/updateBrainState.ts`**: State update logic
  - Derives next turn state from runtime results
  - Updates all temporal variables:
    - `turnCount` (incremented)
    - `temporalStates` (from active features)
    - `predictionState` (from chunkedResult)
    - `afterglow` (calculated, 0-0.2 range)
    - `recentActivityAverage`
    - `recentFieldIntensity`
    - `microSignalDimensions`

### Runtime Integration

- **`src/runtime/runCrystallizedThinkingRuntime.ts`**
  - Added `brainState?: SessionBrainState` input parameter
  - Auto-initializes state if not provided
  - Passes state values to `runChunkedNodePipeline` instead of fixed values
  - Returns `nextBrainState` for next turn

- **`src/runtime/runMainRuntime.ts`**
  - Added `brainState?: SessionBrainState` parameter
  - Passes through to crystallized_thinking mode only
  - No impact on jibun_kaigi_api mode

- **`src/runtime/createObservationRecord.ts`**
  - Accepts `brainState` input
  - Returns `nextBrainState` in observation record
  - Only applies to crystallized_thinking mode

### UI Integration

- **`src/app/NodeStudioPage.tsx`**
  - New state variable: `brainState: SessionBrainState | undefined`
  - Passes `brainState` to `createObservation`
  - Updates `brainState` after each observation (crystallized_thinking only)
  - State flows: observation → nextBrainState → setBrainState → next observation

### Type Definitions

- **`src/runtime/runtimeTypes.ts`**
  - Added `nextBrainState?: SessionBrainState` to `CrystallizedThinkingResult`

- **`src/types/experience.ts`**
  - Added `nextBrainState?: SessionBrainState` to `ObservationRecord`

## Session State Fields

### Core Tracking
- **`sessionId`**: Unique session identifier
- **`turnCount`**: Current turn number (0-indexed, incremented each turn)

### Temporal Memory
- **`temporalStates`**: Map of feature ID → temporal state
  - Tracks when features last fired
  - Used for temporal decay calculations
  - Refractory period tracking

### Predictive Coding
- **`predictionState`**: Expected features for next turn
  - Based on current turn's active features
  - Used for surprise/prediction error detection
  - Confidence tracking

### Activity Residuals
- **`afterglow`**: Residual activation (0-0.2)
  - Calculated from previous turn's activity
  - Biases initial feature strengths
  - Fades over low-activity turns

- **`recentActivityAverage`**: Rolling activity average (0-1)
  - Used for dynamic threshold adjustment
  - Reflects overall interaction intensity

- **`recentFieldIntensity`**: Recent field strength (0-1)
  - Peak intensity from previous turn
  - Influences afterglow calculation

### Dual Stream State
- **`microSignalDimensions`**: Micro-signal tracking
  - `fieldTone`: Current field tone label
  - `activeCueCount`: Number of active cues
  - `fusedConfidence`: Confidence of lexical-signal fusion

### Future Expansion (Minimal Phase 1)
- **`episodicBuffer`**: Array of episodic entries (placeholder)
- **`workspace`**: Active items and capacity (simplified)
- **`interoception`**: Arousal and valence (simplified)

## State Flow Example

```typescript
// Turn 1: Initial state
const result1 = runCrystallizedThinkingRuntime({
  text: 'こんにちは',
  personalLearning,
  // brainState: undefined (auto-initializes)
})
// result1.nextBrainState.turnCount === 1

// Turn 2: Use state from Turn 1
const result2 = runCrystallizedThinkingRuntime({
  text: 'お元気ですか？',
  personalLearning,
  brainState: result1.nextBrainState,
})
// result2.nextBrainState.turnCount === 2
// Previous features influence this turn via:
//   - temporalStates (decay, refractory)
//   - predictionState (surprise detection)
//   - afterglow (residual boost)

// Turn 3: Continuous state
const result3 = runCrystallizedThinkingRuntime({
  text: 'ありがとう',
  personalLearning,
  brainState: result2.nextBrainState,
})
// result3.nextBrainState.turnCount === 3
```

## Integration with Existing Systems

### runChunkedNodePipeline Changes

Before:
```typescript
runChunkedNodePipeline(
  text,
  plasticity,
  0.5,       // fixed threshold base
  0,         // fixed turn
  undefined, // no prior temporal states
  undefined, // no personal bias
  0,         // no afterglow
  undefined, // no prediction state
  somaticMarkers,
)
```

After:
```typescript
runChunkedNodePipeline(
  text,
  plasticity,
  brainState.recentActivityAverage,  // from session
  brainState.turnCount,               // from session
  brainState.temporalStates,          // from session
  personalLearning.pathwayStrengths,  // from personal learning
  brainState.afterglow,               // from session
  brainState.predictionState,         // from session
  somaticMarkers,
)
```

## Testing

Integration test suite: `src/runtime/__tests__/sessionBrainState.integration.test.ts`

Tests verify:
1. Initial state creation when not provided
2. State maintenance across multiple turns (3+ turns)
3. Temporal states update
4. Prediction state update
5. Afterglow calculation (0-0.2 range)
6. Session ID persistence
7. Micro-signal dimensions update

All tests passing: 389/389 (including 7 new integration tests)

## Backward Compatibility

- **jibun_kaigi_api mode**: Completely unchanged
- **crystallized_thinking mode**:
  - Works with or without brainState
  - Auto-initializes if undefined
  - Fully backward compatible

## Next Steps (Future Phases)

Phase 1 establishes the foundation. Future phases will add:

- Precision controller本実装
- Workspace gate本実装
- Episodic/schema/replay本実装
- Mixed node composer
- Interoception詳細化
- UI enhancements to visualize state
- Legacy pipeline cleanup

## Benefits

1. **Temporal Continuity**: System remembers previous interactions
2. **Prediction & Surprise**: Can detect unexpected inputs
3. **Activity Modulation**: Response adapts to conversation intensity
4. **Brain-Like Processing**: More realistic cognitive modeling
5. **Foundation for Memory**: Ready for episodic/working memory expansion
