# Node-AI-Z v2 — Developmental Node Design

Status: **Design / research hypothesis**
Date: 2026-10-07
Target: Node-AI-Z
Initial implementation target: **Phase 1 — Developmental Node Core + Twin Life 0**

## 1. Purpose

Node-AI-Z v2 studies the following question:

> Can a life history change not only stored information, but the physical/structural organization of an artificial brain?

The target is not merely:

~~~text
same architecture
+ different memories
= different answers
~~~

The stronger target is:

~~~text
same birth state + Life A -> Brain A
same birth state + Life B -> Brain B
~~~

where Brain A and Brain B differ in properties such as:

- edge topology
- edge strength distribution
- activation routes
- local prediction structure
- later learning tendencies
- eventually, node specialization / split / merge / dormancy

The long-term hypothesis is:

> The intelligence structure is not completed by the programmer. Life builds the structure.

This document separates **current repository facts** from **new v2 hypotheses**. Existing Node-AI-Z runtimes remain valid baselines and must not be silently rewritten to fit this design.

---

## 2. Position inside the project

Node-AI-Z should remain an independent **Developmental Substrate**.

It may exchange research findings with Avalon, Survival-Core, SIGNAL-Purpose, Why-Brain, AETERNA and other repositories, but it should not become a copy of them.

The Node-AI-Z-specific question is:

> Can local nodes and their connections become a brain whose structure is formed by experience?

When another repository discovers a useful phenomenon, the first question here should be:

> Can the same phenomenon emerge from Node / Edge development rather than importing the other repository's architecture directly?

This preserves meaningful differences between substrates for later comparison in AI Village.

---

## 3. What is intentionally NOT present at birth

The developmental substrate must not begin with semantic nodes such as:

- fear
- love
- curiosity
- safety
- fatigue
- language
- vision
- friend
- enemy
- tree
- self_doubt

It also should not require dedicated high-level modules such as:

- Emotion Module
- Curiosity Module
- Social Module
- Memory Module
- Planning Module

unless later experiments show that a lower-level account is insufficient.

Existing structures such as human-authored CORE_NODES, BINDING_RULES, PATTERN_RULES, contextual mixed-node templates and layered pipelines remain useful **baselines**, but are not the birth architecture of v2.

The rule is:

> Functional names should preferentially be observer interpretations of an emerged structure, not causal labels that create the structure.

---

## 4. What may exist at birth

The system is not required to be a blank slate.

It may inherit **developmental laws without inherited semantic knowledge**.

A birth state may contain:

- anonymous nodes
- activation
- thresholds
- refractory / leak behavior
- sparse weak edges
- local traces
- local prediction
- prediction error
- local homeostatic adjustment
- weight plasticity
- structural plasticity
- bounded resource / connection capacity
- deterministic seeded initialization

Later phases may add:

- metaplasticity
- node split
- node merge
- node dormancy / death
- replay-driven reactivation
- macro/community-level compression

The distinction is:

~~~text
Do not give the system "what things mean".
Give it rules for "how it can change".
~~~

---

## 5. Node ontology

### 5.1 Phase 1 DevelopmentalNode

Phase 1 should start deliberately small:

~~~ts
type DevelopmentalNode = {
  id: string

  activation: number
  previousActivation: number

  predictedActivation: number
  predictionError: number

  threshold: number
  activityEma: number
  errorEma: number

  age: number

  lifecycle: 'active' | 'dormant'

  generation: number
  parentIds: string[]
}
~~~

Node IDs are anonymous:

~~~text
node_0001
node_0002
...
~~~

No semantic label, role or category is allowed in the developmental core.

### 5.2 Long-term hierarchy

The long-term ontology is expected to distinguish:

~~~text
low-level developmental nodes
        ↓
recurrent / coherent communities
        ↓
persistent functional structures
        ↓
possible Macro Nodes / regions
~~~

A community that later behaves like a visual, motor, social or affective region may be labeled that way by the observer layer. The internal mechanism should not need that label in order to function.

---

## 6. Edge ontology

Phase 1 edge:

~~~ts
type DevelopmentalEdge = {
  id: string

  sourceId: string
  targetId: string

  weight: number

  usageEma: number
  utilityEma: number

  age: number
  lowUtilityAge: number

  state: 'weak' | 'stable' | 'dormant'
}
~~~

Weights may be signed.

The edge is not merely "two nodes fired together".

An edge should increasingly represent:

> A locally useful temporal relation that helps the target predict what happens next.

---

## 7. Local prediction

There should be no single mandatory central World Model in Phase 1.

Each node predicts its own next activation from local recurrent information.

Conceptually:

~~~text
predicted_i(t+1)
    = f(recurrent neighborhood at t)
~~~

Actual activation may be:

~~~text
actual_i(t+1)
    = bounded(
        recurrent_drive
        + sensory_drive
        + activation_leak
        - threshold
      )
~~~

Prediction error:

~~~text
error_i(t+1)
    = actual_i(t+1) - predicted_i(t+1)
~~~

The research question is whether a useful larger predictive organization can arise from many local predictive relationships.

---

## 8. Weight plasticity

The current Signal Field's simple co-activation strengthening remains an important baseline, but the developmental runtime should test a more prediction-sensitive rule.

Initial conceptual rule:

~~~text
delta_weight(j -> i)
    =
    learning_rate
    × source_previous_activation
    × target_prediction_error
~~~

Exact equations and constants are experimental parameters, not truths about intelligence.

All weights must remain bounded and deterministic.

---

## 9. Structural plasticity

Phase 1 adds/removes **edges**, not nodes.

### 9.1 Edge candidates

Do not store every possible pair.

A candidate is created only when a plausible local temporal relation occurs, for example:

~~~text
source active at t
+
target has meaningful prediction error at t+1
~~~

Candidate state may include:

~~~ts
type EdgeCandidate = {
  sourceId: string
  targetId: string

  gradientEma: number
  recurrenceCount: number

  positiveCount: number
  negativeCount: number

  firstObservedTick: number
  lastObservedTick: number
}
~~~

### 9.2 Edge birth

One coincidence must not create a permanent edge.

Birth should require:

- recurrence
- sufficient gradient magnitude
- sufficiently consistent direction/sign
- available connection capacity

Example experimental start values:

~~~text
min recurrence ≈ 6
min directional reliability ≈ 0.7
~~~

These must be configurable.

### 9.3 Edge utility

Frequently used does not automatically mean useful.

Where computationally practical, estimate local counterfactual utility:

~~~text
utility(edge)
    ≈ error_without_edge - error_with_edge
~~~

Positive utility means the edge improved prediction.

### 9.4 Edge dormancy / pruning

Long-term low-usage, low-utility, weak edges should first become dormant and later be pruned.

Avoid immediate deletion so later phases can test reactivation.

### 9.5 Capacity

Each node should have bounded incoming/outgoing capacity.

The developmental graph must not solve learning by becoming fully connected.

---

## 10. Local homeostasis

Developmental Node should not use one global controller to force all nodes toward the same activity ratio.

Each node keeps an activity moving average.

Conceptually:

~~~text
threshold_i +=
    homeostasis_rate
    × (activity_ema_i - target_activity_i)
~~~

This is a low-level stability rule, not a psychological variable.

Important checks:

- no global runaway activation
- no all-zero collapse
- thresholds remain bounded
- nodes can retain differentiated activity patterns

---

## 11. Multiple timescales

Even Phase 1 should distinguish:

~~~text
FAST
activation / prediction

MEDIUM
weights / thresholds

SLOW
edge birth / dormancy / pruning
~~~

Structural sweeps should therefore occur less frequently than activation ticks.

Later phases can add:

~~~text
VERY SLOW
node split / merge / death
metaplasticity
community reorganization
~~~

---

## 12. Sensory boundary

Phase 1 does not use text as the developmental brain's native input.

Use anonymous ports:

~~~ts
type SensoryPortFrame = {
  values: number[]
}
~~~

Initial experiment:

~~~text
16 sensory ports
values in approximately [0, 1]
~~~

The brain receives only numbers.

Names such as P/Q/R/S exist only in the experiment/evaluator layer.

### 12.1 Sensory projection

At birth, each sensory port projects to a sparse subset of developmental nodes.

Projection is deterministic from the birth seed.

Phase 1 keeps sensory projection fixed so that internal topology learning can be isolated.

Learning sensory projections is reserved for a later experiment.

---

## 13. Deterministic birth

Reproducibility is mandatory.

All developmental randomness must come from a seeded PRNG.

Do not call Math.random() inside the developmental core.

Same seed must reproduce:

- initial node parameters
- initial sparse edges
- sensory projections
- any other stochastic birth property

This allows:

~~~text
same birth + same life
~~~

to serve as a control against random drift.

---

## 14. Initial brain

First engineering baseline:

~~~text
production exploration:
  nodes = 256

CI / fast Twin Life tests:
  nodes = 64

initial graph:
  sparse, approximately 2% density

initial weights:
  small signed values near zero

semantic nodes:
  none

macro nodes:
  none

experience:
  none
~~~

These values are starting points only.

The repository must treat them as configurable research parameters.

---

## 15. Twin Life 0

Twin Life 0 is the first decisive experiment.

It should run before AI Village, language, emotion or complex embodiment.

### 15.1 Patterns

Create four low-overlap input patterns:

~~~text
P
Q
R
S
~~~

Example:

~~~text
P -> ports 0..3
Q -> ports 4..7
R -> ports 8..11
S -> ports 12..15
~~~

These labels belong only to the experiment code.

### 15.2 Nursery

1. Create one brain from a fixed birth seed.
2. Give it a balanced nursery sequence.
3. Create a snapshot after nursery.
4. Clone the exact snapshot into all experimental subjects.

Do not separately initialize Twin A and Twin B.

### 15.3 Life A

~~~text
P -> Q
R -> S
~~~

Repeated many times.

### 15.4 Life B

~~~text
P -> S
R -> Q
~~~

Repeated many times.

Crucial constraint:

> P, Q, R and S should appear approximately equally often in both lives.

The difference must primarily be **temporal relation**, not simple frequency.

---

## 16. Frozen evaluation

Evaluation must be able to disable learning.

During evaluation:

- weight learning OFF
- edge birth OFF
- edge death OFF
- homeostasis OFF where needed for repeatable measurement

The evaluator may construct activation templates for P/Q/R/S, but these templates must never be fed back into learning.

For example:

~~~text
Brain A after P:
similarity(prediction, Q)
>
similarity(prediction, S)

Brain B after P:
similarity(prediction, S)
>
similarity(prediction, Q)
~~~

and correspondingly:

~~~text
Brain A: R -> S
Brain B: R -> Q
~~~

---

## 17. Same-life controls

Different-life divergence alone is insufficient.

From the same nursery snapshot create:

~~~text
A1, A2 -> both Life A
B1, B2 -> both Life B
~~~

With a deterministic runtime:

~~~text
distance(A1, A2) ≈ 0
distance(B1, B2) ≈ 0
~~~

while:

~~~text
distance(A, B)
>
same-life distance
~~~

This separates experience-dependent structure from stochastic drift.

---

## 18. Structural metrics

Phase 1 should record at least:

- edge count
- shared edge count
- exclusive edges per life
- edge-set Jaccard distance
- mean absolute weight difference
- activation signatures
- prediction errors
- candidate count
- dormant / pruned edge counts
- mean threshold
- mean activity

Node count remains fixed in Phase 1.

---

## 19. Causal lesion test

A structural difference is not enough.

The first causal check should be:

1. identify high-utility edges disproportionately developed in Life A
2. clone Brain A
3. temporarily disable a small top subset of those edges
4. re-run the frozen P/R prediction test

Expected result:

~~~text
Life-A-specific prediction advantage
decreases after lesion
~~~

If topology differs but lesion has no effect on behavior/prediction, the structural difference may be epiphenomenal.

---

## 20. Phase 1 success gates

### Gate 1 — Reproducibility

Same birth + same life produces essentially the same structure.

### Gate 2 — Structural divergence

Same birth + different life produces a clearly larger structural distance than same-life controls.

### Gate 3 — Predictive specialization

Each brain better predicts the temporal relations from its own life.

### Gate 4 — Causal contribution

Lesioning life-specific useful structure reduces that life-specific prediction advantage.

### Gate 5 — No collapse

The network does not:

- lose all edges
- become nearly fully connected
- saturate all activations near 0
- saturate all activations near 1
- produce NaN / Infinity
- pin all thresholds to bounds

---

## 21. Failure is a result

Do not add more mechanisms merely to force a PASS.

Examples of meaningful negative results:

### Topology does not diverge

Possible interpretation:
weight plasticity may be sufficient for this environment, or current structural rules are too weak.

### Topology diverges but behavior does not

Possible interpretation:
structural changes are decorative / epiphenomenal.

### Same-life twins diverge

Possible interpretation:
the system is dominated by uncontrolled stochastic drift.

### Structural plasticity performs worse than weight-only

Possible interpretation:
structural change is not justified under the current task or rule.

These should be recorded, not hidden.

---

## 22. Phase 1 implementation boundary

Add the developmental system as an independent research runtime under:

~~~text
src/developmental/
~~~

Suggested layout:

~~~text
src/developmental/
  config/
  random/
  node/
  edge/
  ports/
  prediction/
  birth/
  lineage/
  state/
  snapshot/
  runtime/
  metrics/
  experiment/
    twinLife0/
  __tests__/
~~~

Phase 1 must NOT yet modify the existing conversation route.

In particular, avoid integrating into:

- src/runtime/runMainRuntime.ts
- src/runtime/runtimeTypes.ts
- src/types/experience.ts
- src/app/NodeStudioPage.tsx
- src/storage/modeScopedStorage.ts

Reason:

The current main runtime is text-oriented. Connecting Developmental Node now would require inventing a text-to-sensory mapping before the lower-level developmental hypothesis has been validated.

Phase 1 therefore remains a **research runtime**, not yet an ImplementationMode.

---

## 23. Existing repository assets

The current repository already contains useful concepts and baselines:

- Signal Field
- propagation
- simple Hebbian plasticity
- homeostasis
- assemblies
- multi-timescale plasticity
- replay / consolidation
- persistence
- Scenario Runner
- Ablation
- risk detection
- developmental dashboards
- SensoryPacket
- teacher / bridge research
- Legacy Node Pipeline
- Layered Thinking
- Crystallized Thinking

The v2 developmental runtime should learn from these, but not collapse them into one architecture.

Especially:

- Legacy semantic nodes remain a human-designed-node baseline.
- New Signal Mode remains a particle/signal baseline.
- Developmental Node becomes the topology-development baseline.

This internal competition is valuable.

---

## 24. Phase 2 — Node structure itself begins to evolve

Only after Twin Life 0 is understood should Phase 2 add:

- metaplasticity
- Node Split
- Shadow Split
- Node Merge
- Node Dormancy / Death
- richer lineage
- true structural capacity adaptation

### 24.1 Metaplasticity

Life should eventually alter not only what is learned, but how future learning occurs.

Potential separation:

~~~text
weightPlasticity
structuralPlasticity
~~~

A node whose prediction improves through weight adjustment does not need rapid structural change.

A node with persistent recurring error despite weight adaptation becomes a structural-change candidate.

### 24.2 Shadow Split

Do not immediately split a node when a threshold is crossed.

Instead:

1. detect a node that repeatedly encounters incompatible local contexts
2. create temporary shadow children
3. evaluate parent vs children on future prediction
4. commit the split only if the children provide sustained benefit after structural cost

This makes specialization an experimentally selected consequence of local explanatory limits.

### 24.3 Merge

Likewise, if two nodes remain functionally redundant, test a shadow merge before committing it.

---

## 25. Phase 3 — Replay through the actual network

Existing replay ideas are valuable, but the eventual developmental version should not only increment symbolic stability scores.

Desired form:

~~~text
past activity trace
    ↓
weak re-injection
    ↓
current network reactivates
    ↓
current local prediction/plasticity rules run
    ↓
structure may be reinterpreted or restabilized
~~~

This lets the current brain re-experience the past rather than simply editing a stored record.

---

## 26. Phase 4 — Embodiment

Only after controlled synthetic experiments should Developmental Node enter a closed sensorimotor loop.

Conceptual interface:

~~~text
WORLD
  ↓
BODY
  ↓
anonymous sensory ports
  ↓
Developmental Node
  ↓
anonymous action ports
  ↓
BODY / WORLD CHANGE
  ↓
next sensation
~~~

The developmental brain should not initially know that an action port means "move", "turn", "touch" or "speak".

It learns action consequences from the closed loop.

---

## 27. Phase 5 — Language

Language should not become the substrate itself.

A later language teacher may connect words to already formed internal structures.

Desired ordering:

~~~text
experience
↓
internal recurring structure
↓
stable concept-like organization
↓
word association
~~~

rather than:

~~~text
word
↓
predefined semantic node
~~~

An LLM may later act as teacher, social partner, translator or observer, but should not secretly become the developmental brain.

---

## 28. Observer boundary

The Observer may say:

- visual-like community
- fear-like response
- curiosity-like exploration
- habit-like route
- social-like structure

The developmental core should not need these names.

This distinction should be preserved in types and directories where practical:

~~~text
core mechanism
!=
observer interpretation
~~~

---

## 29. Research hygiene

For every developmental mechanism, record:

- hypothesis
- exact implementation
- parameters
- expected observation
- falsification condition
- actual result
- whether retained / changed / rejected

Do not rewrite failed hypotheses as if they never existed.

The repository should preserve the history of why the developmental theory changed.

---

## 30. Non-claims

This design does NOT claim that Node-AI-Z:

- reproduces the human brain
- has consciousness
- has emotions
- has a self
- has human-like understanding
- proves a specific neuroscience theory

The project studies whether useful intelligence-like organization can emerge from local developmental rules.

Biological findings may motivate experiments, but Node-AI-Z remains an artificial architecture.

---

## 31. Core principle

The v2 research line should preserve the following principle:

> Do not pre-build the final intelligence structure. Build anonymous nodes and local developmental rules, then test whether life can create the structure.

Or more compactly:

> **The meaning of a Node is not assigned by the programmer. Its life gives the Node its role.**

And the strongest long-term target:

> **Learning is not only changing values inside a fixed brain. Life may change what the brain itself is.**
