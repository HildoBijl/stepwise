export type EnsureStringOptions = {
	nonEmpty?: boolean
}

// Ensure a value is a string. Optionally require it to be non-empty.
export function ensureString(value: unknown, options: EnsureStringOptions = {}): string {
	const { nonEmpty = false } = options

	// Run checks.
	if (typeof value !== 'string') throw new TypeError(`Invalid parameter: expected a string but received "${JSON.stringify(value)}".`)
	if (nonEmpty && value === '') throw new RangeError(`Invalid parameter: expected a non-empty string but received an empty one.`)

	// Return the input for potential chaining. (It's unchanged.)
	return value
}

// Check whether a value is exactly one Unicode letter.
export function isLetter(value: unknown): value is string {
	return typeof value === 'string' && /^\p{L}$/u.test(value)
}
