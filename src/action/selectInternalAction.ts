/**
 * Select Internal Action
 *
 * Phase 3: Selects the final internal action from active sensing policy.
 * Simple wrapper for now, can be extended with additional logic if needed.
 */

import type { InternalActionPolicy, InternalAction } from './buildActiveSensingPolicy'

/**
 * Select the final internal action from policy.
 *
 * Currently just returns the preferred action from the policy.
 * Can be extended to apply final override logic if needed.
 */
export const selectInternalAction = (
  policy: InternalActionPolicy,
): InternalAction => {
  return policy.preferredAction
}
