/**
 * Merge Workspace Items (Phase M3)
 *
 * Merges new candidate items with existing held items, handling duplicates
 * and updating touched timestamps.
 */

import type { WorkspaceItem } from './workspaceTypes';

/**
 * Check if two workspace items are the same (based on ID).
 */
const itemsMatch = (item1: WorkspaceItem, item2: WorkspaceItem): boolean => {
  return item1.id === item2.id;
};

/**
 * Merge a candidate item with an existing held item.
 * Updates salience, stability, and lastTouchedTurn.
 */
const mergeItems = (
  held: WorkspaceItem,
  candidate: WorkspaceItem,
  currentTurn: number,
): WorkspaceItem => {
  // Take the higher salience
  const mergedSalience = Math.max(held.salience, candidate.salience);

  // Average stability with slight bias toward new
  const mergedStability = held.stability * 0.4 + candidate.stability * 0.6;

  // Take the higher unresolved score
  const mergedUnresolved = Math.max(held.unresolved, candidate.unresolved);

  return {
    ...held,
    salience: mergedSalience,
    stability: mergedStability,
    unresolved: mergedUnresolved,
    lastTouchedTurn: currentTurn,
    metadata: {
      ...held.metadata,
      ...candidate.metadata,
      mergedCount: ((held.metadata?.mergedCount as number) ?? 0) + 1,
    },
  };
};

/**
 * Merge new candidates with existing held items.
 * Returns merged items and a list of truly new candidates.
 */
export const mergeWorkspaceItems = (
  heldItems: WorkspaceItem[],
  candidates: WorkspaceItem[],
  currentTurn: number,
): {
  mergedItems: WorkspaceItem[];
  newCandidates: WorkspaceItem[];
} => {
  const mergedItems: WorkspaceItem[] = [...heldItems];
  const newCandidates: WorkspaceItem[] = [];

  for (const candidate of candidates) {
    // Check if this candidate matches an existing held item
    const matchingIndex = mergedItems.findIndex((held) => itemsMatch(held, candidate));

    if (matchingIndex >= 0) {
      // Merge with existing item
      mergedItems[matchingIndex] = mergeItems(
        mergedItems[matchingIndex],
        candidate,
        currentTurn,
      );
    } else {
      // This is a new candidate
      newCandidates.push(candidate);
    }
  }

  return {
    mergedItems,
    newCandidates,
  };
};
