# App Facade Runtime - Phase M16

## Overview

App Facade Runtime is a minimal but functional runtime layer that allows different applications to connect to Mother Core through standardized facades. This implementation transforms the facade from a "view type" to an actual "connection runtime" that manages read/write permissions and routes requests safely.

## Key Concepts

### 1. Facade is NOT a Persona

The facade is **not**:
- A personality
- A prompt template
- Intelligence itself

The facade **is**:
- A connection interface
- A permission boundary
- A view/write scope controller

### 2. App Modes

Currently supported modes:
- `crystallized_thinking` - Full-featured thinking mode with read/write access
- `jibun_kaigi` - Future: personal meeting/conference mode
- `observer` - Read-only observation and debugging mode
- `future_app` - Stub for future applications

## Architecture

```
┌─────────────────────────────────────────────────┐
│           External Apps                         │
│  (crystallized_thinking, observer, etc.)        │
└────────────────┬────────────────────────────────┘
                 │
                 │ FacadeRequest
                 ▼
┌─────────────────────────────────────────────────┐
│         Facade Runtime Layer                    │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Request Resolution & Validation          │  │
│  │  - validateFacadeRequest                 │  │
│  │  - resolveFacadeRequest                  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Capability Policy                        │  │
│  │  - Readable scopes                       │  │
│  │  - Writable scopes                       │  │
│  │  - Promotion permissions                 │  │
│  │  - Trunk access permissions              │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  View Building                           │  │
│  │  - buildFacadeView                       │  │
│  │  - Filter by permissions                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Action Router                           │  │
│  │  - Route read/write actions              │  │
│  │  - Validate permissions                  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Registry                                │  │
│  │  - Track active facades                  │  │
│  │  - Log requests                          │  │
│  │  - Cleanup stale sessions                │  │
│  └──────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────┘
                 │
                 │ Filtered CoreView
                 ▼
┌─────────────────────────────────────────────────┐
│           Mother Core                           │
│  (Shared Trunk + Personal Branch)              │
└─────────────────────────────────────────────────┘
```

## Files

### Core Type Definitions

- **`facadeRuntimeTypes.ts`** - All runtime types including:
  - `FacadeScope` - Layer identification
  - `FacadeCapabilityPolicy` - Permission definitions
  - `FacadeRequest` - Request types from apps
  - `FacadeResponse` - Response types to apps
  - `FacadeView` - Filtered view based on permissions
  - `FacadeObservableState` - Observable runtime state

### Permission Layer

- **`facadeCapabilityPolicy.ts`** - Defines capabilities for each mode:
  - `getFacadeCapabilityPolicy()` - Get policy for a mode
  - `validateFacadeScope()` - Check read/write permissions
  - `canAccessPromotions()` - Check promotion access
  - `canAccessTrunkSafety()` - Check trunk safety access

### View Building

- **`buildFacadeView.ts`** - Converts CoreView to FacadeView:
  - `buildFacadeView()` - Main conversion function
  - Filters schemas, nodes, biases based on policy
  - Creates safe session snapshots
  - Includes promotion data if allowed

### Request Handling

- **`resolveFacadeRequest.ts`** - Routes and resolves requests:
  - `resolveFacadeRequest()` - Main entry point
  - Handles `get_view`, `submit_branch_update`, `propose_promotion`
  - Validates permissions
  - Returns appropriate responses

### Action Routing

- **`facadeActionRouter.ts`** - Internal action routing:
  - `routeFacadeAction()` - Route facade actions
  - Validates action permissions
  - Returns action results

### Registry Management

- **`facadeRuntimeRegistry.ts`** - Manages active facades:
  - Tracks active facade sessions
  - Logs requests for observability
  - Cleans up stale facades
  - Provides statistics

### Main Orchestrator

- **`runFacadeRuntime.ts`** - Main facade runtime entry point:
  - `runFacadeRuntime()` - Process facade requests
  - `getFacadeRuntimeState()` - Get observable state
  - `initializeFacadeRuntime()` - Initialize facade
  - Convenience functions for each mode

## Usage Examples

### Initialize a Facade Runtime

```typescript
import { createCrystallizedThinkingRuntime } from '@/core/facadeRuntime'

const { facadeId, policy } = createCrystallizedThinkingRuntime(
  'session-123',
  'user-456'
)

console.log(facadeId) // 'facade-crystallized_thinking-session-123'
console.log(policy.readableScopes) // ['shared_trunk', 'personal_branch', 'app_facade']
```

### Process a Request

```typescript
import { runFacadeRuntime, createTestRequest } from '@/core/facadeRuntime'
import { resolveCoreView } from '@/core'

// Create request
const request = createTestRequest('crystallized_thinking', 'session-123', 'user-456')

// Process through runtime
const response = runFacadeRuntime(request, coreView, trunk, branch)

if (response.success && response.type === 'view') {
  console.log('Visible schemas:', response.view.visibleSchemas.length)
  console.log('Visible nodes:', response.view.visibleMixedNodes.length)
}
```

### Observe Runtime State

```typescript
import { getFacadeRuntimeState } from '@/core/facadeRuntime'

const state = getFacadeRuntimeState()

console.log('Active facades:', state.activeFacades.length)
console.log('Recent requests:', state.recentRequests.length)
console.log('Notes:', state.notes)
```

## Capability Policies

### Crystallized Thinking

```typescript
{
  mode: 'crystallized_thinking',
  readableScopes: ['shared_trunk', 'personal_branch', 'app_facade'],
  writableScopes: ['personal_branch'],
  allowPromotionRead: true,
  allowPromotionWrite: true,
  allowTrunkApplyRead: true,
  allowTrunkApplyWrite: false  // Trunk writes go through guardian
}
```

### Observer

```typescript
{
  mode: 'observer',
  readableScopes: ['shared_trunk', 'personal_branch', 'app_facade'],
  writableScopes: [],  // Read-only
  allowPromotionRead: true,
  allowPromotionWrite: false,
  allowTrunkApplyRead: true,
  allowTrunkApplyWrite: false
}
```

### Future App

```typescript
{
  mode: 'future_app',
  readableScopes: ['personal_branch'],  // Minimal access
  writableScopes: [],
  allowPromotionRead: false,
  allowPromotionWrite: false,
  allowTrunkApplyRead: false,
  allowTrunkApplyWrite: false
}
```

## Request Types

### Get View

Request a filtered view of the core state:

```typescript
{
  type: 'get_view',
  mode: 'crystallized_thinking',
  sessionId: 'session-123',
  userId: 'user-456'
}
```

### Submit Branch Update

Update the personal branch:

```typescript
{
  type: 'submit_branch_update',
  mode: 'crystallized_thinking',
  sessionId: 'session-123',
  userId: 'user-456',
  payload: {
    // Update data
  }
}
```

### Propose Promotion

Propose a promotion candidate:

```typescript
{
  type: 'propose_promotion',
  mode: 'crystallized_thinking',
  sessionId: 'session-123',
  userId: 'user-456',
  candidateType: 'schema',
  candidateData: { /* ... */ },
  reasons: ['Recurring pattern', 'High confidence']
}
```

## Testing

Run the facade runtime tests:

```bash
npm run test:run src/core/facadeRuntime/__tests__/runFacadeRuntime.test.ts
```

## Future Extensions

### Not Implemented Yet

- Jibun Kaigi runtime integration
- Full UI for each app mode
- Production authentication per facade
- RBAC fine-grained permissions
- Cross-app synchronized UX
- Complex trunk/branch transactions
- API method integration

### Next Steps

1. Integrate facade runtime with actual UI components
2. Add authentication layer per facade
3. Implement real-time updates through facades
4. Add more granular permission controls
5. Create facade-specific middleware
6. Add observability dashboards

## Design Principles

1. **Separation of Concerns**: Facade is connection, not intelligence
2. **Permission Boundaries**: Each app has clearly defined access
3. **Safe by Default**: Minimal permissions for new app stubs
4. **Observable**: Full logging and state inspection
5. **Extensible**: Easy to add new app modes
6. **Type-Safe**: Full TypeScript typing throughout

## Integration with Mother Core

The facade runtime sits between apps and the core:

1. Apps send `FacadeRequest` to runtime
2. Runtime validates request and permissions
3. Runtime builds filtered `FacadeView` from `CoreView`
4. Runtime routes actions to appropriate handlers
5. Runtime returns `FacadeResponse` to app
6. All access is logged and observable

This ensures:
- Apps never directly access core data
- Permissions are enforced consistently
- Cross-app data leakage is prevented
- All access is auditable
