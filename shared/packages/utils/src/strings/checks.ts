// Ensure a value is a string. Optionally require it to be non-empty.
export function ensureString(x: unknown, nonEmpty = false): string {
	// Run checks.
	if (typeof x !== 'string') throw new TypeError(`Invalid parameter: expected a string but received "${JSON.stringify(x)}".`)
	if (nonEmpty && x === '') throw new RangeError(`Invalid parameter: expected a non-empty string but received an empty one.`)

	// Return the input for potential chaining. (It's unchanged.)
	return x
}

// Precompiled regexes.
const latinLetterRegExp = /^[a-z]$/i
const latinGreekLetterRegExp = /^[a-zα-ω]$/i

// Check if a single character is a letter. Optionally (dis)allow Greek letters.
export function isLetter(x: string, allowGreekLetter = true): x is string {
	if (x.length !== 1) return false
	return (allowGreekLetter ? latinGreekLetterRegExp : latinLetterRegExp).test(x)
}
