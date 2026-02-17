// Checks whether a value is a number or a numeric string.
export function isNumber(number: unknown): number is number | string {
  // Reject explicit objects (including Number objects), null and undefined.
  if (number === null) return false
  if (typeof number === 'object') return false

  // Reject booleans and symbols.
  if (typeof number === 'boolean' || typeof number === 'symbol') return false

  // Accept actual numbers (but not NaN).
  if (typeof number === 'number') return !Number.isNaN(number)

  // Accept numeric strings (non-empty after trim).
  if (typeof number === 'string') {
    const trimmed = number.trim()
    if (trimmed === '') return false
    const n = Number(trimmed)
    return !Number.isNaN(n)
  }

  // Other primitive types (bigint, function, etc.) are not accepted.
  return false
}

// Ensure the given value is a number; convert numeric strings to numbers.
export function ensureNumber(number: unknown, requirePositive = false, requireNonZero = false, requireFinite = false): number {
	// Throw an error when not a number.
  if (!isNumber(number)) throw new TypeError(`Input error: the given value must be a number or numeric string, but received type "${typeof number}" and value "${String(number)}".`)

  // At this point x is number | string (per isNumber guard). Convert it to a number.
  const num = typeof number === 'number' ? number : parseFloat(number)

	// Run various checks.
  if (requireFinite && !Number.isFinite(num)) throw new TypeError(`Input error: value "${number}" could not be converted to a finite number.`)
  if (requirePositive && num < 0) throw new RangeError(`Input error: the given value was negative, but it must be positive. "${num}" was received.`)
  if (requireNonZero && num === 0) throw new RangeError(`Input error: the given value was zero, but this is not allowed.`)

	// Checks passed. Return the outcome.
  return num
}

// Checks whether a value is an integer or a string representation of an integer.
export function isInt(number: unknown): number is number | string {
	// Check that the value is a number.
	if (!isNumber(number)) return false

	// Approve Infinity as integer-like.
	if (Math.abs(number as any) === Infinity) return true

	// On finite, convert to a numeric value and check integerness.
	const x = typeof number === 'number' ? number : Number((number as string).trim())
	return Number.isInteger(x)
}

// Ensures the given value is an integer; converts numeric strings to integers.
export function ensureInt(number: unknown, requirePositive = false, requireNonZero = false, requireFinite = false): number {
	// First convert/validate as a number and run positivity/non-zero checks.
	const x = ensureNumber(number, requirePositive, requireNonZero, requireFinite)

	// If finite, ensure it's an integer.
	if (Number.isFinite(x) && !Number.isInteger(x)) throw new TypeError(`Input error: the given value must be an integer, but received value "${number}".`)

	// Return processed result.
	return x
}
