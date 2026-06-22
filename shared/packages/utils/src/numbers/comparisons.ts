import { mergeDefaults } from '../objects'

import { isNumber } from './checks'

/*
 * Script-wise comparisons
 */

// Comparison tolerance used by compareNumbers.
export const epsilon = 1e-9

// Compare two numbers for approximate equality.
export function compareNumbers(input: number, reference: number): boolean {
	// Check if the absolute difference is within bounds.
  const diff = Math.abs(input - reference)
  if (diff < epsilon) return true

	// Check if the relative difference is within bounds.
  const absB = Math.abs(reference)
  if (absB > epsilon && diff / absB < epsilon) return true

	// No reason to consider equality found.
  return false
}

export function getNumberDirection(input: number, reference: number): -1 | 0 | 1 {
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
		direction: getNumberDirection(input, reference),
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
	if (!isNumber(absoluteTolerance) || absoluteTolerance < 0) throw new Error(`Invalid NumberEqualityOptions: absoluteTolerance must be a non-negative number, but received "${absoluteTolerance}".`)
	if (!isNumber(relativeTolerance) || relativeTolerance < 0) throw new Error(`Invalid NumberEqualityOptions: relativeTolerance must be a non-negative number, but received "${relativeTolerance}".`)
	return options
}

export function getAbsoluteDifference(input: number, reference: number): number {
	return Math.abs(input - reference)
}

export function getRelativeDifference(input: number, reference: number): number {
	const max = Math.max(Math.abs(input), Math.abs(reference))
	return max === 0 ? 0 : Math.abs(input - reference) / max
}
