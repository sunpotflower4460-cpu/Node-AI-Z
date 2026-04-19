/**
 * Derive Workspace Candidates (Phase M3)
 *
 * Extracts candidate items from lexical, signal, proto meaning, and option layers
 * for potential admission into the workspace.
 */

import type { WorkspaceItem, WorkspaceCandidateInput } from './workspaceTypes';

/**
 * Derive workspace candidates from current turn's signals and meanings.
 * These are potential items that could be admitted to the workspace.
 */
export const deriveWorkspaceCandidates = (
  input: WorkspaceCandidateInput,
): WorkspaceItem[] => {
  const candidates: WorkspaceItem[] = [];

  // Extract from lexical state
  if (input.lexicalState) {
    const { explicitQuestion, requestType, optionLabels, explicitEntities, explicitTensions } = input.lexicalState;

    // Add explicit question if present
    if (explicitQuestion) {
      candidates.push({
        id: `lexical:question`,
        label: 'explicit question detected',
        salience: 0.7, // Questions are high salience
        source: 'lexical',
        stability: 0.6,
        unresolved: 0.8, // Questions are inherently unresolved
        lastTouchedTurn: input.turnCount,
        metadata: { type: 'question', hasQuestion: true },
      });
    }

    // Add request type
    if (requestType) {
      candidates.push({
        id: `lexical:request:${requestType}`,
        label: requestType,
        salience: 0.5,
        source: 'lexical',
        stability: 0.5,
        unresolved: 0.4,
        lastTouchedTurn: input.turnCount,
        metadata: { type: 'request', requestType },
      });
    }

    // Add option labels
    if (optionLabels && optionLabels.length > 0) {
      for (const option of optionLabels.slice(0, 3)) { // Limit to top 3
        candidates.push({
          id: `lexical:option:${option}`,
          label: option,
          salience: 0.6,
          source: 'lexical',
          stability: 0.4,
          unresolved: 0.7,
          lastTouchedTurn: input.turnCount,
          metadata: { type: 'option', label: option },
        });
      }
    }

    // Add explicit tensions
    if (explicitTensions && explicitTensions.length > 0) {
      for (const tension of explicitTensions.slice(0, 2)) { // Limit to top 2
        candidates.push({
          id: `lexical:tension:${tension}`,
          label: tension,
          salience: 0.65,
          source: 'lexical',
          stability: 0.5,
          unresolved: 0.85, // Tensions are highly unresolved
          lastTouchedTurn: input.turnCount,
          metadata: { type: 'tension', text: tension },
        });
      }
    }

    // Add entities
    if (explicitEntities && explicitEntities.length > 0) {
      for (const entity of explicitEntities.slice(0, 2)) {
        candidates.push({
          id: `lexical:entity:${entity}`,
          label: entity,
          salience: 0.4,
          source: 'lexical',
          stability: 0.7, // Entities are more stable
          unresolved: 0.3,
          lastTouchedTurn: input.turnCount,
          metadata: { type: 'entity', name: entity },
        });
      }
    }
  }

  // Extract from micro-signal state
  if (input.microSignalState) {
    const { dimensions, fieldTone } = input.microSignalState;

    // Add dominant signal dimensions (those above threshold)
    const signalThreshold = 0.55;
    for (const [dimName, dimValue] of Object.entries(dimensions)) {
      if (dimValue >= signalThreshold) {
        candidates.push({
          id: `signal:dim:${dimName}`,
          label: `${dimName} (${dimValue.toFixed(2)})`,
          salience: Math.min(dimValue * 0.8, 0.7), // Scale down signal salience
          source: 'signal',
          stability: 0.3, // Signals are less stable
          unresolved: 1.0 - dimValue, // Higher values are more resolved
          lastTouchedTurn: input.turnCount,
          metadata: { dimension: dimName, value: dimValue },
        });
      }
    }

    // Add field tone if significant
    if (fieldTone !== 'mid-band') {
      candidates.push({
        id: `signal:tone:${fieldTone}`,
        label: `tone: ${fieldTone}`,
        salience: 0.45,
        source: 'signal',
        stability: 0.4,
        unresolved: 0.5,
        lastTouchedTurn: input.turnCount,
        metadata: { fieldTone },
      });
    }
  }

  // Extract from sensory proto meanings
  if (input.sensoryProtoMeanings && input.sensoryProtoMeanings.length > 0) {
    for (const proto of input.sensoryProtoMeanings.slice(0, 3)) {
      if (proto.strength >= 0.4) { // Only add strong sensory meanings
        candidates.push({
          id: `proto:sensory:${proto.id}`,
          label: proto.glossJa,
          salience: proto.strength * 0.9, // Proto meanings have high salience
          source: 'proto',
          stability: 0.6,
          unresolved: 0.5,
          lastTouchedTurn: input.turnCount,
          metadata: { protoType: 'sensory', protoId: proto.id, strength: proto.strength },
        });
      }
    }
  }

  // Extract from narrative proto meanings
  if (input.narrativeProtoMeanings && input.narrativeProtoMeanings.length > 0) {
    for (const proto of input.narrativeProtoMeanings.slice(0, 3)) {
      if (proto.strength >= 0.4) { // Only add strong narrative meanings
        candidates.push({
          id: `proto:narrative:${proto.id}`,
          label: proto.glossJa,
          salience: proto.strength * 0.95, // Narrative meanings are highly salient
          source: 'proto',
          stability: 0.7,
          unresolved: 0.6, // Narratives may remain unresolved
          lastTouchedTurn: input.turnCount,
          metadata: { protoType: 'narrative', protoId: proto.id, strength: proto.strength },
        });
      }
    }
  }

  // Extract from option awareness
  if (input.optionAwareness?.detectedOptions && input.optionAwareness.detectedOptions.length > 0) {
    for (const option of input.optionAwareness.detectedOptions.slice(0, 3)) {
      candidates.push({
        id: `option:${option.id}`,
        label: option.label,
        salience: option.salience,
        source: 'option',
        stability: 0.5,
        unresolved: 0.75, // Options are unresolved until chosen
        lastTouchedTurn: input.turnCount,
        metadata: { optionId: option.id, optionSalience: option.salience },
      });
    }
  }

  return candidates;
};
