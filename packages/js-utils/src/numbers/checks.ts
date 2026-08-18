// Check whether a value is a JavaScript number other than NaN.
export function isNumber(value: unknown): value is number {
	return typeof value === 'number' && !Number.isNaN(value)
}

// Check whether a value is a number or a non-empty string representing a number.
export function isNumeric(value: unknown): value is number | string {
	if (isNumber(value)) return true
	return typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))
}

export type EnsureNumberOptions = {
	nonNegative?: boolean
	nonZero?: boolean
	allowInfinity?: boolean
}

// Ensure the given value is a number; convert numeric strings to numbers.
export function ensureNumber(value: unknown, options: EnsureNumberOptions = {}): number {
	const { nonNegative = false, nonZero = false, allowInfinity = false } = options

	// Throw an error when not a number.
	if (!isNumeric(value)) throw new TypeError(`Input error: the given value must be a number or numeric string, but received type "${typeof value}" and value "${String(value)}".`)

	// Convert using the same rules as isNumeric.
	const number = typeof value === 'number' ? value : Number(value.trim())

	// Run various checks.
	if (!allowInfinity && !Number.isFinite(number)) throw new TypeError(`Input error: value "${value}" could not be converted to a finite number.`)
	if (nonNegative && number < 0) throw new RangeError(`Input error: the given value was negative, but it must be non-negative. "${number}" was received.`)
	if (nonZero && number === 0) throw new RangeError(`Input error: the given value was zero, but this is not allowed.`)

	// Checks passed. Return the outcome.
	return number
}

// Check whether a value is a JavaScript integer.
export function isInteger(value: unknown): value is number {
	return Number.isInteger(value)
}

// Check whether a value is an integer or a non-empty string representing an integer.
export function isNumericInteger(value: unknown): value is number | string {
	if (!isNumeric(value)) return false
	return Number.isInteger(typeof value === 'number' ? value : Number(value.trim()))
}

// Ensures the given value is an integer; converts numeric strings to integers.
export function ensureInteger(number: unknown, options: EnsureNumberOptions = {}): number {
	// First convert/validate as a number and run positivity/non-zero checks.
	const x = ensureNumber(number, options)

	// If finite, ensure it's an integer.
	if (Number.isFinite(x) && !Number.isInteger(x)) throw new TypeError(`Input error: the given value must be an integer, but received value "${number}".`)

	// Return processed result.
	return x
}
