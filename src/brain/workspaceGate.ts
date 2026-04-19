/**
 * Workspace Gate (Phase M3)
 *
 * Controls what gets held, updated, shielded, or flushed in the workspace.
 * This is the main gate that sits between incoming signals and the workspace.
 */

import type {
  WorkspaceItem,
  WorkspaceGateResult,
  WorkspaceGateDecision,
  WorkspaceGateConfig,
  WorkspaceGateAction,
} from './workspaceTypes';
import { DEFAULT_WORKSPACE_GATE_CONFIG } from './workspaceTypes';
import type { WorkspaceState } from '../workspace/workspacePhaseMachine';
import { deriveWorkspaceCandidates, type WorkspaceCandidateInput } from './deriveWorkspaceCandidates';
import { mergeWorkspaceItems } from './mergeWorkspaceItems';
import { scoreAllWorkspaceItems, type SalienceUpdateFactors } from './scoreWorkspaceSalience';

export type WorkspaceGateInput = {
  currentWorkspace: WorkspaceState;
  candidateInput: WorkspaceCandidateInput;
  salienceFactors: SalienceUpdateFactors;
  config?: Partial<WorkspaceGateConfig>;
};

/**
 * Determine the gate action for an item based on workspace phase and item properties.
 */
const determineGateAction = (
  item: WorkspaceItem,
  phase: WorkspaceState['phase'],
  config: WorkspaceGateConfig,
  currentTurn: number,
  isNewCandidate: boolean,
): { action: WorkspaceGateAction; reason: string } => {
  const turnsSinceTouch = currentTurn - item.lastTouchedTurn;

  // FLUSH: Remove stale items
  if (turnsSinceTouch >= config.flushAfterTurns) {
    return {
      action: 'flush',
      reason: `Stale item (${turnsSinceTouch} turns since touch)`,
    };
  }

  // FLUSH: Remove items with very low salience
  if (item.salience < config.minSalienceToHold && !isNewCandidate) {
    return {
      action: 'flush',
      reason: `Low salience (${item.salience.toFixed(2)})`,
    };
  }

  // Phase-specific gate behavior
  switch (phase) {
    case 'encode': {
      // In encode phase, admit new items readily
      if (isNewCandidate && item.salience >= config.minSalienceToAdmit) {
        return {
          action: 'update',
          reason: 'Encode phase: admitting new salient item',
        };
      }
      // Update existing items
      if (!isNewCandidate) {
        return {
          action: 'update',
          reason: 'Encode phase: updating held item',
        };
      }
      // Shield low-salience new items
      return {
        action: 'shield',
        reason: 'Encode phase: candidate below admission threshold',
      };
    }

    case 'hold': {
      // In hold phase, protect existing items and resist new ones
      if (!isNewCandidate && item.stability > 0.5) {
        return {
          action: 'hold',
          reason: 'Hold phase: protecting stable held item',
        };
      }
      if (isNewCandidate) {
        // Only admit very salient new items
        if (item.salience >= 0.7) {
          return {
            action: 'update',
            reason: 'Hold phase: very high salience overcomes resistance',
          };
        }
        return {
          action: 'shield',
          reason: 'Hold phase: resisting new admission',
        };
      }
      return {
        action: 'hold',
        reason: 'Hold phase: maintaining held item',
      };
    }

    case 'block': {
      // In block phase, aggressively filter
      if (item.salience < 0.6) {
        return {
          action: 'flush',
          reason: 'Block phase: filtering low-salience item',
        };
      }
      if (isNewCandidate) {
        return {
          action: 'shield',
          reason: 'Block phase: blocking new admission',
        };
      }
      // Keep only strong existing items
      return {
        action: 'hold',
        reason: 'Block phase: keeping strong held item',
      };
    }

    case 'release': {
      // In release phase, clear stale items and prepare for reset
      if (turnsSinceTouch >= 2) {
        return {
          action: 'flush',
          reason: 'Release phase: clearing stale item',
        };
      }
      if (isNewCandidate && item.salience >= config.minSalienceToAdmit) {
        return {
          action: 'update',
          reason: 'Release phase: admitting fresh item',
        };
      }
      if (!isNewCandidate && item.salience >= 0.5) {
        return {
          action: 'hold',
          reason: 'Release phase: keeping fresh held item',
        };
      }
      return {
        action: 'flush',
        reason: 'Release phase: clearing for reset',
      };
    }
  }
};

/**
 * Apply the workspace gate to control what gets into the workspace.
 * This is where hold / update / shield / flush decisions are made.
 */
export const applyWorkspaceGate = (input: WorkspaceGateInput): WorkspaceGateResult => {
  const config: WorkspaceGateConfig = {
    ...DEFAULT_WORKSPACE_GATE_CONFIG,
    ...input.config,
  };

  const gateNotes: string[] = [];
  const decisions: WorkspaceGateDecision[] = [];

  // Step 1: Convert current held items from WorkspaceState to WorkspaceItem format
  const currentHeldItems: WorkspaceItem[] = input.currentWorkspace.heldItems.map((item) => ({
    id: item.id,
    label: item.content,
    salience: item.strength, // Map strength to salience
    source: 'lexical' as const, // Default source for old items
    stability: input.currentWorkspace.stability,
    unresolved: 0.5, // Default unresolved
    lastTouchedTurn: input.candidateInput.turnCount - item.age,
    metadata: { age: item.age },
  }));

  gateNotes.push(`Starting gate with ${currentHeldItems.length} held items in ${input.currentWorkspace.phase} phase`);

  // Step 2: Derive new candidates from current turn
  const newCandidates = deriveWorkspaceCandidates(input.candidateInput);
  gateNotes.push(`Derived ${newCandidates.length} candidates from current turn`);

  // Step 3: Score existing held items
  const scoredHeldItems = scoreAllWorkspaceItems(
    currentHeldItems,
    input.salienceFactors,
    input.candidateInput.turnCount,
  );

  // Step 4: Merge candidates with held items
  const { mergedItems, newCandidates: trulyNewCandidates } = mergeWorkspaceItems(
    scoredHeldItems,
    newCandidates,
    input.candidateInput.turnCount,
  );
  gateNotes.push(`Merged: ${newCandidates.length - trulyNewCandidates.length} updated, ${trulyNewCandidates.length} new`);

  // Step 5: Make gate decisions for merged items
  const resultItems: WorkspaceItem[] = [];
  let shieldedCount = 0;
  let flushedCount = 0;

  for (const item of mergedItems) {
    const { action, reason } = determineGateAction(
      item,
      input.currentWorkspace.phase,
      config,
      input.candidateInput.turnCount,
      false, // Not a new candidate
    );

    decisions.push({ itemId: item.id, action, reason });

    if (action === 'hold' || action === 'update') {
      resultItems.push(item);
    } else if (action === 'flush') {
      flushedCount++;
    }
    // shield doesn't apply to merged items
  }

  // Step 6: Make gate decisions for new candidates
  for (const candidate of trulyNewCandidates) {
    const { action, reason } = determineGateAction(
      candidate,
      input.currentWorkspace.phase,
      config,
      input.candidateInput.turnCount,
      true, // Is a new candidate
    );

    decisions.push({ itemId: candidate.id, action, reason });

    if (action === 'update') {
      resultItems.push(candidate);
    } else if (action === 'shield') {
      shieldedCount++;
    } else if (action === 'flush') {
      flushedCount++;
    }
    // hold doesn't apply to new candidates
  }

  // Step 7: Enforce max held items limit
  let finalItems = resultItems;
  if (resultItems.length > config.maxHeldItems) {
    // Sort by salience and keep top items
    finalItems = resultItems
      .sort((a, b) => b.salience - a.salience)
      .slice(0, config.maxHeldItems);

    const overflow = resultItems.length - config.maxHeldItems;
    flushedCount += overflow;
    gateNotes.push(`Overflow: flushed ${overflow} items to stay within limit of ${config.maxHeldItems}`);
  }

  const admittedCount = trulyNewCandidates.filter((c) =>
    finalItems.some((f) => f.id === c.id),
  ).length;

  gateNotes.push(
    `Gate result: ${finalItems.length} held, ${admittedCount} admitted, ${shieldedCount} shielded, ${flushedCount} flushed`,
  );

  return {
    heldItems: finalItems,
    decisions,
    gateNotes,
    admittedCount,
    shieldedCount,
    flushedCount,
  };
};
