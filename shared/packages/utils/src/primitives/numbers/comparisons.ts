// Comparison tolerance used by compareNumbers.
export const epsilon = 1e-12

// Compare two numbers for approximate equality.
export function compareNumbers(a: number, b: number): boolean {
	// Check if the absolute difference is within bounds.
  const diff = Math.abs(a - b)
  if (diff < epsilon) return true

	// Check if the relative difference is within bounds.
  const absB = Math.abs(b)
  if (absB > epsilon && diff / absB < epsilon) return true

	// No reason to consider equality found.
  return false
}
