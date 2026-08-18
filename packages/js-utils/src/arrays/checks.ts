import { type EnsureNumberOptions, isNumber, isNumeric, ensureNumber } from '../numbers'

// Check if the given variable is an array.
export function isArray(x: unknown): x is readonly unknown[] {
	return Array.isArray(x)
}

// Check if the given parameter is an array that's empty.
export function isEmptyArray(x: unknown): x is readonly [] {
	return Array.isArray(x) && x.length === 0
}

// Ensure the given value is an array.
export function ensureArray<T>(x: T[]): T[]
export function ensureArray<T>(x: readonly T[]): readonly T[]
export function ensureArray(x: unknown): readonly unknown[]
export function ensureArray(x: unknown): readonly unknown[] {
	if (!isArray(x)) throw new TypeError(`Input error: expected an array but received type "${typeof x}".`)
	return x
}

// Check whether a variable is an array filled with JavaScript numbers.
export function isNumberArray(x: unknown): x is readonly number[] {
	return isArray(x) && x.every(v => isNumber(v))
}

// Check whether a variable is an array filled with numbers or numeric strings.
export function isNumericArray(x: unknown): x is readonly (number | string)[] {
	return isArray(x) && x.every(v => isNumeric(v))
}

// Check whether a variable is an array filled with numbers. This function can be given the same extra options as ensureNumber.
export function ensureNumberArray(x: unknown, options: EnsureNumberOptions = {}): number[] {
	const array = ensureArray(x)
	return array.map(v => ensureNumber(v, options))
}

// Check if an array has duplicates. Optionally, an equals function can be defined.
export function hasDuplicates<T>(array: readonly T[], equals: (a: T, b: T) => boolean = (a, b) => a === b): boolean {
	return array.some((x, index) => array.some((y, index2) => index < index2 && equals(x, y)))
}
