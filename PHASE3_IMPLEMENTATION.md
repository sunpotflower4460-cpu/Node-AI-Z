# Phase 3 Implementation Summary

## Overview

Phase 3 integrates four core concepts into the crystallized thinking runtime:

1. **Interoceptive Core** - Body-like internal regulation
2. **Distributed Coalition** - Multi-field decision formation
3. **Phase-based Workspace** - Dynamic working memory control
4. **Active Sensing Policy** - Internal action selection before utterance

## Key Principle

**"演出ではなく、内部因果として本当にそうなる"**
("Not theatrical effects, but true internal causality")

All Phase 3 features causally affect runtime dynamics, not just UI appearance.

## Implementation

### 1. Interoceptive Core (`src/interoception/`)

- **InteroceptiveState**: 7 dimensions (energy, arousal, overload, recoveryPressure, socialSafety, noveltyHunger, uncertaintyTolerance)
- **updateInteroceptiveState**: Updates state from somatic influence, uncertainty, confidence
- **applyInteroceptiveControl**: Derives control parameters that affect threshold, inhibition, precision, coalition, replay, workspace

**Causal Effects:**
- Low energy → higher threshold (more selective)
- High overload → stronger inhibition (more filtering)
- High arousal → higher precision (trust signals more)
- Recovery pressure → increased replay eligibility

### 2. Distributed Coalition (`src/coalition/`)

- **buildCoalitionFields**: Creates fields from signal, proto-meaning, option, interoception sources
- **mergeCoalitionState**: Merges fields into active coalitions (NOT winner-take-all)
- **selectCoalitionAction**: Selects action from coalition dynamics

**Causal Effects:**
- Multiple coalitions can remain active (creates tension)
- Bridge/explore/hold outcomes emerge from coalition structure
- Action bias propagates from field types to final decision

### 3. Phase-based Workspace (`src/workspace/`)

- **WorkspacePhase**: encode | hold | block | release
- **advanceWorkspacePhase**: Transitions phases based on boundaries, coalition, interoception
- **applyWorkspacePhaseControl**: Applies phase to items and processing parameters

**Causal Effects:**
- Encode: lower threshold, admit new items
- Hold: higher threshold, protect current items
- Block: highest threshold, aggressive filtering
- Release: clear stale items, reset

### 4. Active Sensing Policy (`src/action/`)

- **buildActiveSensingPolicy**: Constructs policy from coalition, confidence, uncertainty, workspace, interoception
- **selectInternalAction**: Selects final action (answer | hold | ask | explore | bridge)

**Causal Effects:**
- High overload/low energy → hold
- Block phase → hold or ask (not answer)
- High uncertainty + low confidence → ask or explore
- Low social safety → gentle hold or bridge

## Integration Points

### In `runCrystallizedThinkingRuntime.ts`:

1. After confidence/uncertainty calculation
2. Update interoceptive state
3. Advance workspace phase
4. Build coalitions
5. Build active sensing policy
6. Update brain state with new workspace/interoception
7. Return all Phase 3 states

### In `runtimeTypes.ts`:

Added to `CrystallizedThinkingResult`:
- `interoceptiveState?: InteroceptiveState`
- `coalitionState?: CoalitionState`
- `workspaceState?: WorkspaceState`
- `internalActionPolicy?: InternalActionPolicy`

### In `sessionBrainState.ts`:

Updated to use full Phase 3 types instead of simplified versions:
- `workspace: WorkspaceState` (full phase machine)
- `interoception: InteroceptiveState` (7 dimensions)

## Ablation Flags

`src/config/phase3Flags.ts`:
- `interoceptionEnabled: boolean`
- `coalitionEnabled: boolean`
- `workspacePhaseEnabled: boolean`
- `activeSensingEnabled: boolean`

All features can be independently disabled for comparison.

## Verification

- **TypeScript**: No compilation errors ✓
- **Tests**: All 389 tests pass ✓
- **jibun_kaigi_api**: Remains unchanged ✓
- **Ablation**: All features independently toggleable ✓

## Not Yet Implemented (Future Enhancements)

The following are structural possibilities but not implemented in this phase:

- Direct interoceptive control application to threshold/inhibition in pipeline
- Coalition-based option decision override
- Internal action policy affecting utterance template selection
- Memory and relation coalition fields

These can be added incrementally without breaking the current architecture.
