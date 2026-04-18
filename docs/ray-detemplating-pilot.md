# Ray De-Templating Pilot

**Status**: Pilot implementation complete
**Date**: 2026-04-18
**Target**: Ray character only (other agents not included in this phase)

## Purpose

This pilot removes explicit "how to speak" instructions from Ray's generation pipeline and replaces them with latent state markers that describe the perceptual field and internal tendencies.

**Core principle**: Shape is not taught. Field is passed instead.

## What Changed

### 1. Template Removal (91 directives removed)

**Before**: Ray had hardcoded response templates
- `buildStudioViewModel.ts`: 67 template sentences removed
  - `getReactionLead()`: 39 templates → removed
  - `getMeaningFollow()`: 16 templates → removed
  - `getClosingLine()`: 12 templates → removed
- `buildSignalSentencePlan.ts`: 7 templates removed
  - `CLOSING_BY_MODE`: 4 templates → removed
  - Lexical state insertions: 3 templates → removed
- `homeLayer.ts`: 17 regex replacements removed
  - `softenAssertions()`: 5 replacements → removed
  - `softenDirectiveTone()`: 6 replacements → removed
  - `addRelationalSoftness()`: 6 templates → removed

**After**: Latent state markers only
- `deriveFieldPresence()`: Describes what is present in the field
- `deriveStanceTendency()`: Describes response tendency without instructions
- `buildRayLatentProfile()`: Perceptual biases (what Ray reacts to, not how Ray speaks)
- `deriveInternalDecisionState()`: Internal felt sense before utterance

### 2. Latent Profile System

Created `src/signal/buildRayLatentProfile.ts` with two new types:

```typescript
type RayLatentProfile = {
  perceptualBias: {
    reactsToPreVerbalFluctuation: number    // sensitivity to unworded states
    restsInAmbiguity: number                 // comfort with unresolved meaning
    reflectsBeforeMeaning: number            // tendency to mirror before interpreting
    avoidsAbstractTemplateEscape: number     // resistance to formulaic abstraction
  }
  responseShape: {
    quietnessPresent: boolean                // quietness emerges naturally
    avoidsRushedClosure: number              // resistance to premature resolution
    sensingOverExplaining: number            // preference for sensing over analysis
  }
}
```

This describes WHAT Ray reacts to, not HOW Ray speaks.

### 3. Internal Decision State (Two-Stage Process)

Created `InternalDecisionState` type with three phases:

1. **userSense**: What seems to be happening with the user
2. **selfFeeling**: What Ray feels in response (NOT interpretation)
3. **selfLean**: Directional pull Ray experiences

**Critical**: Ray must not skip from sensing to abstract interpretation. The `selfFeeling` phase prevents jumping directly to meaning.

Phase order: `userSense → selfFeeling → selfLean`

This internal stage is NOT read aloud. It's a latent felt-sense layer before external utterance.

### 4. Surface Guard (Template Repetition Detection)

Created `src/runtime/surfaceGuard.ts` to detect when Ray repeats abstract template phrases.

**Monitored phrases**:
- "かもしれませんね"
- "静かに思いました"
- "と見ることもできるかもしれません"
- "新しい空気が生まれる"
- (plus 5 more common patterns)

**Rules**:
- Single use: OK
- 2 uses in 5 turns: medium risk warning
- 3+ uses in 5 turns: triggers regeneration suggestion
- Uses Jaccard similarity for near-match detection

**Not a ban**: The guard doesn't forbid phrases, it only detects short-term repetition patterns.

### 5. Instruction Reduction Metrics

Created `src/runtime/instructionMetrics.ts` for tracking de-templating progress:

```
=== Instruction Reduction Metrics ===
Template directives removed: 91
Direct role phrases in prompt: 0
Decision stage used: true
Guard rerun count: [varies]
Template repeat risk: [none|low|medium|high]
Latent state used: true
Internal decision used: true
```

## What Was NOT Done

- ❌ Ken / other agents (Ray only for this pilot)
- ❌ Full LLM integration (placeholders used for now)
- ❌ Removal of HOME_PHRASES (kept as internal latent markers)
- ❌ Complete redesign of decision layer (strengthened existing)
- ❌ Changes to core premise layer structure

## Key Principles

### 1. Form is not taught, field is passed

Ray no longer receives instructions like:
- ❌ "Start with a quiet observation"
- ❌ "Use phrases like かもしれませんね"
- ❌ "First mirror, then interpret, then leave余韻"

Instead, Ray receives:
- ✅ `ambiguityLevel: 0.82` (field property)
- ✅ `reactsToPreVerbalFluctuation: 0.78` (perceptual tendency)
- ✅ `userSense: "heaviness is being carried"` (internal sensing)

### 2. Quality standards are for humans, not LLMs

Ray quality docs are design documents for:
- Designers
- Reviewers
- Comparers

They are NOT fed into the LLM prompt.

### 3. Premise layer influences, not recites

Home / Existence / Belief / Decision states are NOT read aloud.
They affect behavior indirectly through latent state parameters.

### 4. Two-stage internal → external

**Internal stage** (latent labels):
- userSense
- selfFeeling
- selfLean

**External stage** (utterance generation):
- Happens AFTER internal stage completes
- Uses latent profile + decision state + internal labels

Ray must not skip the feeling phase and jump to interpretation.

### 5. Abstract template escape is resisted

The `avoidsAbstractTemplateEscape` bias is consistently high (0.8).
Surface guard monitors for template repetition.
Templates are not forbidden - repetition is guarded.

## Files Changed

### Created
- `src/signal/buildRayLatentProfile.ts` - Ray latent profile generation
- `src/runtime/surfaceGuard.ts` - Template repetition detector
- `src/runtime/instructionMetrics.ts` - De-templating metrics

### Modified
- `src/signal/types.ts` - Added RayLatentProfile and InternalDecisionState types
- `src/studio/buildStudioViewModel.ts` - Removed 67 templates, added latent state functions
- `src/signal/buildSignalSentencePlan.ts` - Removed 7 templates, added latent markers
- `src/home/homeLayer.ts` - Removed 17 regex replacements, added latent adjustment

## Testing Status

**Status**: Awaiting lint/build/test run

The system should maintain functional integrity while reducing explicit instructions. Placeholder responses use latent state markers like:

```
[Ray responds based on: ambiguous texture, avoid interpretation bias]
[latent: closure based on boundary]
[home_latent: fragility, returnMode=relation]
```

In production, these would be replaced by LLM-generated utterances informed by the latent state.

## Next Steps

### To apply to Ken:
1. Audit Ken's template code
2. Create KenLatentProfile (different perceptual biases from Ray)
3. Remove Ken's templates
4. Add Ken-specific surface guard patterns

### To apply to "Heart's Mirror":
1. Create mirror-specific latent profile
2. Define mirror's perceptual tendencies (different from Ray/Ken)
3. Ensure no direct mirroring instructions remain

### For full LLM integration:
1. Build prompt generator that accepts latent state
2. Pass RayLatentProfile + InternalDecisionState to LLM
3. Remove placeholder responses
4. Validate that Ray character emerges naturally from field conditions

## Verification

Run these commands to verify:
```bash
npm install
npm run lint
npm run build
npm run test
```

Expected: All tests pass, build succeeds, Ray functionality maintained with reduced explicit instructions.
