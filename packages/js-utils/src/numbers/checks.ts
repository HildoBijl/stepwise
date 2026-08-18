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

// Ensure the given value is a number.
export function ensureNumber(value: unknown, options: EnsureNumberOptions = {}): number {
	const { nonNegative = false, nonZero = false, allowInfinity = false } = options

	// Throw an error when not a number.
	if (!isNumber(value)) throw new TypeError(`Input error: the given value must be a number, but received type "${typeof value}" and value "${String(value)}".`)

	// Run various checks.
	if (!allowInfinity && !Number.isFinite(value)) throw new TypeError(`Input error: value "${value}" must be finite.`)
	if (nonNegative && value < 0) throw new RangeError(`Input error: the given value was negative, but it must be non-negative. "${value}" was received.`)
	if (nonZero && value === 0) throw new RangeError(`Input error: the given value was zero, but this is not allowed.`)

	// Checks passed. Return the outcome.
	return value
}

// Ensure the given value is a number or numeric string and normalize it to a number.
export function ensureNumeric(value: unknown, options: EnsureNumberOptions = {}): number {
	if (!isNumeric(value)) throw new TypeError(`Input error: the given value must be a number or numeric string, but received type "${typeof value}" and value "${String(value)}".`)
	return ensureNumber(typeof value === 'number' ? value : Number(value.trim()), options)
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

// Ensure the given value is an integer.
export function ensureInteger(value: unknown, options: EnsureNumberOptions = {}): number {
	// First convert/validate as a number and run positivity/non-zero checks.
	const integer = ensureNumber(value, options)

	// If finite, ensure it's an integer.
	if (Number.isFinite(integer) && !Number.isInteger(integer)) throw new TypeError(`Input error: the given value must be an integer, but received value "${value}".`)

	// Return processed result.
	return integer
}

// Ensure the given value is an integer or numeric integer string and normalize it to an integer.
export function ensureNumericInteger(value: unknown, options: EnsureNumberOptions = {}): number {
	if (!isNumericInteger(value)) throw new TypeError(`Input error: the given value must be an integer or numeric integer string, but received type "${typeof value}" and value "${String(value)}".`)
	return ensureInteger(typeof value === 'number' ? value : Number(value.trim()), options)
}
