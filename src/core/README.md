# Phase M9: Shared Trunk / Personal Branch / App Facade Separation

## Overview

Phase M9 introduces architectural separation of the Mother Core into three distinct layers:

1. **Shared Trunk** - Universal patterns and knowledge shared across all users
2. **Personal Branch** - Individual user's learned patterns and session state
3. **App Facade** - Application-specific views and access control

## Architecture

### Shared Trunk (Read-Mostly)

The trunk contains universal patterns that have been promoted from personal branches:

- **Schema Patterns**: Recurring patterns validated across users
- **Mixed Nodes**: Multi-axis states that show universal applicability
- **Conceptual Biases**: General tendencies in meaning-making
- **Proto-Meaning Biases**: Universal weights for proto-meaning detection

**Key Properties:**
- Read-mostly (updated rarely through promotion)
- Shared across all users and apps
- Higher bar for inclusion (strength > 0.6, recurrence > 5)
- Provides subtle influence (default weight: 0.2)

### Personal Branch (Active Learning)

The branch contains user-specific learning and state:

- **Personal Schemas**: User's recurring patterns (not yet promoted)
- **Personal Mixed Nodes**: User's multi-axis states
- **Pathway Strengths**: User's learning state
- **Somatic Markers**: User's body-state associations
- **Session Brain State**: Active runtime state

**Key Properties:**
- Read-write (actively updated each turn)
- User-specific and private
- Lower bar for inclusion (strength > 0.2, recurrence > 2)
- Provides strong influence (default weight: 0.8)

### App Facade (View Layer)

The facade controls how each application interacts with the core:

- **Access Control**: Which operations the app can perform
- **Influence Weights**: How much trunk vs branch affects the app
- **Visibility Filters**: Which patterns the app can see
- **Display Preferences**: What metadata to show

**Key Properties:**
- Application-specific configuration
- Controls read/write permissions
- Manages trunk/branch weight balance
- Future-ready for multiple apps (Jibun Kaigi, etc.)

## Data Flow

```
User Input
    ↓
App Facade (permissions + weights)
    ↓
Core View Resolver
    ├─→ Shared Trunk (0.2 weight) → trunk influence
    └─→ Personal Branch (0.8 weight) → branch influence
    ↓
Merged State (weighted combination)
    ↓
Crystallized Thinking Runtime
    ↓
Session Brain State Update
    ↓
Personal Branch Update
```

## Integration Points

### Runtime Integration

In `runCrystallizedThinkingRuntime.ts`:

1. Initialize trunk, branch, and facade
2. Resolve unified core view
3. Apply trunk influence (subtle, read-only)
4. Apply branch influence (strong, primary)
5. Derive promotion candidates
6. Update branch with new session state

### Type Integration

Added to `SessionBrainState`:
- `coreInfluenceNotes?: CoreInfluenceNote[]`

Added to `CrystallizedThinkingResult`:
- `coreView?: CoreView`
- `coreInfluenceNotes?: CoreInfluenceNote[]`
- `promotionCandidates?: PromotionCandidate[]`

## Promotion System

Patterns in the personal branch can be promoted to shared trunk when they:

1. **Schema Promotion**:
   - Strength >= 0.6
   - Confidence >= 0.6
   - Recurrence count >= 5
   - Age >= 50 turns
   - Not already in trunk

2. **Mixed Node Promotion**:
   - Salience >= 0.6
   - Coherence >= 0.6
   - Novelty < 0.5 (stable, familiar)
   - Multi-axis (>= 3 axes preferred)
   - Not already in trunk

3. **Approval Process** (Future):
   - AI sensei review
   - Cross-user validation
   - Manual approval for critical patterns

## Observe Integration

Core influence is visible in the Observe layer through:

- **Origin Tags**: Each schema/node shows `shared_trunk` or `personal_branch`
- **Influence Notes**: Show how trunk/branch affected processing
- **Promotion Candidates**: List patterns ready for promotion
- **Weights**: Display effective trunk/branch influence weights

## Future Extensions

### Not Implemented Yet (Per Requirements)

1. **Automatic Promotion**: Currently just identifies candidates
2. **AI Sensei Review**: Promotion approval guardian
3. **Multi-User Validation**: Cross-user pattern validation
4. **Distributed Trunk**: Trunk replication across instances
5. **Access Control**: Production-grade permissions
6. **Complex Merge**: Sophisticated trunk/branch reconciliation

### Ready For (Architecture Supports)

1. **Jibun Kaigi Integration**: Different facade configuration
2. **Multiple Users**: Each gets their own branch
3. **Trunk Evolution**: Patterns can be promoted/demoted
4. **A/B Testing**: Different trunk/branch weights per app

## File Structure

```
src/core/
  ├── coreTypes.ts              # Type definitions
  ├── sharedTrunk.ts            # Trunk state management
  ├── personalBranch.ts         # Branch state management
  ├── appFacade.ts              # Facade configurations
  ├── resolveCoreView.ts        # Merge trunk + branch
  ├── applyTrunkInfluence.ts    # Trunk influence logic
  ├── applyBranchInfluence.ts   # Branch influence logic
  ├── derivePromotionCandidates.ts # Promotion scoring
  ├── index.ts                  # Module exports
  └── __tests__/
      └── phaseM9Integration.test.ts # Integration tests
```

## Design Principles

1. **Separation of Concerns**: Trunk, branch, facade have distinct responsibilities
2. **No Mixing**: Shared and personal data never intermingle at storage level
3. **Weighted Influence**: Runtime merges via configurable weights, not mutation
4. **Read-Only Trunk**: Trunk provides influence but doesn't mutate branch
5. **Future-Ready**: Architecture supports multiple apps and users
6. **Gradual Promotion**: Patterns earn their way to trunk through validation

## Usage Example

```typescript
import {
  createEmptySharedTrunk,
  createEmptyPersonalBranch,
  createCrystallizedThinkingFacade,
  resolveCoreView,
  applyTrunkInfluence,
  applyBranchInfluence,
  derivePromotionCandidates,
} from './core'

// Initialize (in production, load from storage)
const trunk = createEmptySharedTrunk()
const branch = createEmptyPersonalBranch('user-123')
const facade = createCrystallizedThinkingFacade()

// Resolve unified view
const coreView = resolveCoreView(trunk, branch, facade)

// Apply influences
const trunkResult = applyTrunkInfluence(
  schemas,
  nodes,
  trunk,
  facade.trunkInfluenceWeight
)

const branchResult = applyBranchInfluence(
  schemas,
  nodes,
  branch,
  facade.branchInfluenceWeight
)

// Check for promotion candidates
const candidates = derivePromotionCandidates(
  branch,
  trunk,
  currentTurn
)
```
