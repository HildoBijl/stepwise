import { hasOnlyKeys, isPlainObject, mergeDefaults } from '../objects/index.ts'

import { ensureNumber, isNumber } from './checks.ts'

/*
 * Script-wise comparisons
 */

// Comparison tolerance used by approximatelyEqual.
export const epsilon = 1e-10

// Compare two numbers for approximate equality.
export function approximatelyEqual(input: number, reference: number): boolean {
	input = ensureNumber(input, { allowInfinity: true })
	reference = ensureNumber(reference, { allowInfinity: true })
	if (Object.is(input, reference)) return true
	if (!Number.isFinite(input) || !Number.isFinite(reference)) return false

	// Check if the absolute difference is within bounds.
	const diff = Math.abs(input - reference)
	if (diff < epsilon) return true

	// Check if the relative difference is within bounds.
	const absB = Math.abs(reference)
	if (absB > epsilon && diff / absB < epsilon) return true

	// No reason to consider equality found.
	return false
}

export function compareNumbers(input: number, reference: number): -1 | 0 | 1 {
	input = ensureNumber(input, { allowInfinity: true })
	reference = ensureNumber(reference, { allowInfinity: true })
	return input > reference ? 1 : input < reference ? -1 : 0
}

/*
 * Option-wise comparisons
 */

export type NumberEqualityOptions = {
	absoluteTolerance: number
	relativeTolerance: number
}
export type NumberEqualityOptionsInput = Partial<NumberEqualityOptions>

export const defaultNumberEqualityOptions: NumberEqualityOptions = {
	absoluteTolerance: 0,
	relativeTolerance: 0,
}

export function isNumberEqualityOptionsInput(value: unknown): value is NumberEqualityOptionsInput {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['absoluteTolerance', 'relativeTolerance'])) return false
	const { absoluteTolerance, relativeTolerance } = value
	return (absoluteTolerance === undefined || (isNumber(absoluteTolerance) && absoluteTolerance >= 0))
		&& (relativeTolerance === undefined || (isNumber(relativeTolerance) && relativeTolerance >= 0))
}

export type NumberEqualityResult = {
	equal: boolean
	direction: -1 | 0 | 1
	absoluteDifference: number
	relativeDifference: number
	absoluteTolerance: number
	relativeTolerance: number
}

export function numbersEqual(input: number, reference: number, options?: NumberEqualityOptionsInput): boolean {
	return checkNumberEquality(input, reference, options).equal
}

export function checkNumberEquality(input: number, reference: number, options: NumberEqualityOptionsInput = {}): NumberEqualityResult {
	const equalityOptions = resolveNumberEqualityOptions(options)
	const absoluteDifference = getAbsoluteDifference(input, reference)
	const relativeDifference = getRelativeDifference(input, reference)

	const absoluteEqual = absoluteDifference <= equalityOptions.absoluteTolerance
	const relativeEqual = relativeDifference <= equalityOptions.relativeTolerance
	const equal = absoluteEqual || relativeEqual

	return {
		equal,
		direction: compareNumbers(input, reference),
		absoluteDifference,
		relativeDifference,
		absoluteTolerance: equalityOptions.absoluteTolerance,
		relativeTolerance: equalityOptions.relativeTolerance,
	}
}

export function resolveNumberEqualityOptions(options: NumberEqualityOptionsInput = {}): NumberEqualityOptions {
	return validateNumberEqualityOptions(mergeDefaults(options, defaultNumberEqualityOptions))
}

export function validateNumberEqualityOptions(options: NumberEqualityOptions): NumberEqualityOptions {
	const { absoluteTolerance, relativeTolerance } = options
	ensureNumber(absoluteTolerance, { nonNegative: true, allowInfinity: true })
	ensureNumber(relativeTolerance, { nonNegative: true, allowInfinity: true })
	return options
}

export function adjustNumberTolerances(options: NumberEqualityOptionsInput, factor: number) {
	const equalityOptions = resolveNumberEqualityOptions(options)
	factor = ensureNumber(factor, { nonNegative: true, nonZero: true })
	return {
		absoluteTolerance: factor * equalityOptions.absoluteTolerance,
		relativeTolerance: factor * equalityOptions.relativeTolerance,
	}
}

export function getAbsoluteDifference(input: number, reference: number): number {
	input = ensureNumber(input, { allowInfinity: true })
	reference = ensureNumber(reference, { allowInfinity: true })
	if (Object.is(input, reference)) return 0
	return Math.abs(input - reference)
}

export function getRelativeDifference(input: number, reference: number): number {
	input = ensureNumber(input, { allowInfinity: true })
	reference = ensureNumber(reference, { allowInfinity: true })
	if (Object.is(input, reference)) return 0
	if (!Number.isFinite(input) || !Number.isFinite(reference)) return Infinity
	const max = Math.max(Math.abs(input), Math.abs(reference))
	return max === 0 ? 0 : Math.abs(input - reference) / max
}

export function isMultipleOf(a: number, b: number): boolean {
	a = ensureNumber(a)
	b = ensureNumber(b)
	if (b === 0) throw new RangeError(`Invalid divisor: expected a non-zero number.`)
	return approximatelyEqual(a / b, Math.round(a / b))
}
