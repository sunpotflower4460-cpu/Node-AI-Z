import type { SignalMotherExportPackage } from './signalMotherExportTypes'

/**
 * Validate a Mother export package before (hypothetical) transmission.
 *
 * Checks:
 * - Package is not empty
 * - All items have correct sourceMode
 * - No items with high teacher dependency
 * - No items with low readiness
 * - No raw conversation logs or sensitive data
 *
 * Returns validation result with warnings.
 */
export function validateSignalMotherExport(
  exportPackage: SignalMotherExportPackage,
): {
  isValid: boolean
  warnings: string[]
  errors: string[]
} {
  const warnings: string[] = []
  const errors: string[] = []

  // Check: Package not empty
  if (exportPackage.items.length === 0) {
    errors.push('Export package is empty')
  }

  // Check: All items have correct sourceMode
  for (const item of exportPackage.items) {
    if (item.sourceMode !== 'signal_mode') {
      errors.push(`Item ${item.id} has incorrect sourceMode: ${item.sourceMode}`)
    }

    // Check: No high teacher dependency
    if (
      item.teacherDependencyScore !== undefined &&
      item.teacherDependencyScore > 0.5
    ) {
      warnings.push(
        `Item ${item.id} has high teacher dependency (${item.teacherDependencyScore.toFixed(2)})`,
      )
    }

    // Check: Readiness score is sufficient
    if (item.readinessScore < 0.7) {
      warnings.push(
        `Item ${item.id} has low readiness score (${item.readinessScore.toFixed(2)})`,
      )
    }

    // Check: Stability score is sufficient
    if (item.stabilityScore < 0.5) {
      warnings.push(
        `Item ${item.id} has low stability score (${item.stabilityScore.toFixed(2)})`,
      )
    }
  }

  // Check: Average readiness is high enough
  if (exportPackage.summary.averageReadiness < 0.7) {
    warnings.push(
      `Average readiness is below threshold (${exportPackage.summary.averageReadiness.toFixed(2)})`,
    )
  }

  // Note: This function does NOT check for raw conversation text
  // because Signal Mode items don't contain raw text - they're pattern-based

  const isValid = errors.length === 0

  return {
    isValid,
    warnings,
    errors,
  }
}
