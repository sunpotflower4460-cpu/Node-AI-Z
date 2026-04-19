/**
 * Workspace Types (Phase M3)
 *
 * Types for the workspace gate system that controls what gets held, updated,
 * shielded, or flushed in the crystallized thinking workspace.
 */

export type WorkspaceSource =
  | 'lexical'
  | 'signal'
  | 'proto'
  | 'option'
  | 'somatic'
  | 'prediction';

export type WorkspaceItem = {
  id: string;
  label: string;
  salience: number;          // 0.0 - 1.0
  source: WorkspaceSource;
  stability: number;         // 0.0 - 1.0
  unresolved: number;        // 0.0 - 1.0
  lastTouchedTurn: number;
  metadata?: Record<string, unknown>;
};

export type WorkspaceGateAction = 'hold' | 'update' | 'shield' | 'flush';

export type WorkspaceGateDecision = {
  itemId: string;
  action: WorkspaceGateAction;
  reason: string;
  salienceChange?: number;
};

export type WorkspaceGateResult = {
  heldItems: WorkspaceItem[];
  decisions: WorkspaceGateDecision[];
  gateNotes: string[];
  admittedCount: number;
  shieldedCount: number;
  flushedCount: number;
};

/**
 * Input for deriving workspace candidates from current turn signals
 */
export type WorkspaceCandidateInput = {
  lexicalState?: {
    explicitQuestion?: boolean;
    requestType?: string;
    optionLabels?: string[];
    explicitEntities?: string[];
    explicitTensions?: string[];
  };
  microSignalState?: {
    dimensions: Record<string, number>;
    fieldTone: string;
  };
  sensoryProtoMeanings?: Array<{
    id: string;
    glossJa: string;
    strength: number;
  }>;
  narrativeProtoMeanings?: Array<{
    id: string;
    glossJa: string;
    strength: number;
  }>;
  optionAwareness?: {
    detectedOptions?: Array<{
      id: string;
      label: string;
      salience: number;
    }>;
  };
  turnCount: number;
};

/**
 * Configuration for workspace gate behavior
 */
export type WorkspaceGateConfig = {
  maxHeldItems: number;
  minSalienceToAdmit: number;
  minSalienceToHold: number;
  stabilityDecayRate: number;
  unresolvedThreshold: number;
  flushAfterTurns: number;
};

export const DEFAULT_WORKSPACE_GATE_CONFIG: WorkspaceGateConfig = {
  maxHeldItems: 7,
  minSalienceToAdmit: 0.3,
  minSalienceToHold: 0.2,
  stabilityDecayRate: 0.1,
  unresolvedThreshold: 0.6,
  flushAfterTurns: 5,
};
