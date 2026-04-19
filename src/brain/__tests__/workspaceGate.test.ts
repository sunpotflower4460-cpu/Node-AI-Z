/**
 * Tests for Workspace Gate (Phase M3)
 */

import { describe, it, expect } from 'vitest';
import { applyWorkspaceGate } from '../workspaceGate';
import { deriveWorkspaceCandidates } from '../deriveWorkspaceCandidates';
import { createDefaultWorkspaceState } from '../../workspace/workspacePhaseMachine';

describe('Workspace Gate (Phase M3)', () => {
  describe('deriveWorkspaceCandidates', () => {
    it('should derive candidates from lexical state', () => {
      const candidates = deriveWorkspaceCandidates({
        lexicalState: {
          explicitQuestion: true,
          requestType: 'advice',
          optionLabels: ['option1', 'option2'],
          explicitEntities: ['entity1'],
          explicitTensions: ['tension1'],
        },
        turnCount: 5,
      });

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates.some((c) => c.source === 'lexical')).toBe(true);
      expect(candidates.some((c) => c.metadata?.type === 'question')).toBe(true);
    });

    it('should derive candidates from proto meanings', () => {
      const candidates = deriveWorkspaceCandidates({
        sensoryProtoMeanings: [
          { id: 'sensory1', glossJa: '感覚', strength: 0.7 },
        ],
        narrativeProtoMeanings: [
          { id: 'narrative1', glossJa: '物語', strength: 0.8 },
        ],
        turnCount: 3,
      });

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates.some((c) => c.source === 'proto')).toBe(true);
    });

    it('should derive candidates from option awareness', () => {
      const candidates = deriveWorkspaceCandidates({
        optionAwareness: {
          detectedOptions: [
            { id: 'opt1', label: 'Option 1', salience: 0.7 },
            { id: 'opt2', label: 'Option 2', salience: 0.5 },
          ],
        },
        turnCount: 2,
      });

      expect(candidates.length).toBe(2);
      expect(candidates.every((c) => c.source === 'option')).toBe(true);
    });
  });

  describe('applyWorkspaceGate', () => {
    it('should admit items in encode phase', () => {
      const workspaceState = createDefaultWorkspaceState();
      workspaceState.phase = 'encode';

      const result = applyWorkspaceGate({
        currentWorkspace: workspaceState,
        candidateInput: {
          narrativeProtoMeanings: [
            { id: 'n1', glossJa: '意味1', strength: 0.7 },
            { id: 'n2', glossJa: '意味2', strength: 0.6 },
          ],
          turnCount: 1,
        },
        salienceFactors: {
          afterglow: 0.1,
          recentFieldIntensity: 0.5,
          overloadPressure: 0.2,
          safetySense: 0.7,
          unresolvedThreadCount: 0,
        },
      });

      expect(result.heldItems.length).toBeGreaterThan(0);
      expect(result.admittedCount).toBeGreaterThan(0);
      expect(result.decisions.length).toBeGreaterThan(0);
    });

    it('should shield items in hold phase', () => {
      const workspaceState = createDefaultWorkspaceState();
      workspaceState.phase = 'hold';
      workspaceState.stability = 0.8;

      const result = applyWorkspaceGate({
        currentWorkspace: workspaceState,
        candidateInput: {
          narrativeProtoMeanings: [
            { id: 'n1', glossJa: '新しい意味', strength: 0.5 },
          ],
          turnCount: 5,
        },
        salienceFactors: {
          afterglow: 0.05,
          recentFieldIntensity: 0.4,
          overloadPressure: 0.3,
          safetySense: 0.6,
          unresolvedThreadCount: 0,
        },
      });

      expect(result.shieldedCount).toBeGreaterThan(0);
    });

    it('should flush items in block phase', () => {
      const workspaceState = createDefaultWorkspaceState();
      workspaceState.phase = 'block';
      workspaceState.heldItems = [
        { id: 'old1', content: 'old item', strength: 0.3, age: 3 },
        { id: 'old2', content: 'another old', strength: 0.4, age: 2 },
      ];

      const result = applyWorkspaceGate({
        currentWorkspace: workspaceState,
        candidateInput: {
          narrativeProtoMeanings: [
            { id: 'n1', glossJa: '低い意味', strength: 0.3 },
          ],
          turnCount: 10,
        },
        salienceFactors: {
          afterglow: 0.0,
          recentFieldIntensity: 0.2,
          overloadPressure: 0.7,
          safetySense: 0.4,
          unresolvedThreadCount: 2,
        },
      });

      expect(result.flushedCount).toBeGreaterThan(0);
    });

    it('should clear stale items in release phase', () => {
      const workspaceState = createDefaultWorkspaceState();
      workspaceState.phase = 'release';
      workspaceState.heldItems = [
        { id: 'stale1', content: 'stale item', strength: 0.5, age: 3 },
        { id: 'fresh1', content: 'fresh item', strength: 0.6, age: 0 },
      ];

      const result = applyWorkspaceGate({
        currentWorkspace: workspaceState,
        candidateInput: {
          turnCount: 15,
        },
        salienceFactors: {
          afterglow: 0.0,
          recentFieldIntensity: 0.3,
          overloadPressure: 0.1,
          safetySense: 0.6,
          unresolvedThreadCount: 0,
        },
      });

      expect(result.flushedCount).toBeGreaterThan(0);
    });

    it('should enforce max held items limit', () => {
      const workspaceState = createDefaultWorkspaceState();
      workspaceState.phase = 'encode';

      const result = applyWorkspaceGate({
        currentWorkspace: workspaceState,
        candidateInput: {
          narrativeProtoMeanings: Array.from({ length: 15 }, (_, i) => ({
            id: `n${i}`,
            glossJa: `意味${i}`,
            strength: 0.8,
          })),
          turnCount: 1,
        },
        salienceFactors: {
          afterglow: 0.1,
          recentFieldIntensity: 0.5,
          overloadPressure: 0.2,
          safetySense: 0.7,
          unresolvedThreadCount: 0,
        },
        config: {
          maxHeldItems: 7,
          minSalienceToAdmit: 0.3,
          minSalienceToHold: 0.2,
          stabilityDecayRate: 0.1,
          unresolvedThreshold: 0.6,
          flushAfterTurns: 5,
        },
      });

      expect(result.heldItems.length).toBeLessThanOrEqual(7);
    });
  });
});
