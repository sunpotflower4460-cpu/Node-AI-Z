import type { PreconditionFilter } from './types'
import { buildHomeState } from './buildHomeState'
import { buildExistenceState } from './buildExistenceState'
import { buildBeliefState } from './buildBeliefState'

/**
 * Builds the complete precondition filter.
 * This filter affects all downstream processing but is not directly rendered.
 */
export const buildPreconditionFilter = (): PreconditionFilter => {
  return {
    home: buildHomeState(),
    existence: buildExistenceState(),
    belief: buildBeliefState(),
  }
}
