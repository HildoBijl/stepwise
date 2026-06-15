import { isInt, isNumber, mergeDefaults } from '@step-wise/utils'

export type FloatEqualityOptions = {
	absoluteTolerance: number
	relativeTolerance: number
	significantDigitTolerance: number
	checkPower: boolean
}
export type FloatEqualityOptionsInput = Partial<FloatEqualityOptions>

export const defaultFloatEqualityOptions: FloatEqualityOptions = {
	absoluteTolerance: 0, // The effective absolute tolerance is at least the minimum tolerance implied by the Float's significant digits, so 0 means "use the minimum".
	relativeTolerance: 0, // 0 means "only use absolute tolerance" since equality is concluded when at least one of the two tolerances fires. (There is no minimum relative tolerance.)
	significantDigitTolerance: Infinity,
	checkPower: false,
}

export type FloatEqualityResult = {
	equal: boolean
	number: {
		equal: boolean
		direction: -1 | 0 | 1
		absoluteDifference: number
		relativeDifference: number
		absoluteTolerance: number
		relativeTolerance: number
	}
	significantDigits: {
		equal: boolean
		difference: number
		tolerance: number
	}
	power?: {
		equal: boolean
		difference: number
	}
}

export function resolveFloatEqualityOptions(options: FloatEqualityOptionsInput = {}): FloatEqualityOptions {
	const settings = mergeDefaults(options, defaultFloatEqualityOptions)
	return validateFloatEqualityOptions(settings)
}

export function validateFloatEqualityOptions(options: FloatEqualityOptions): FloatEqualityOptions {
	const { absoluteTolerance, relativeTolerance, significantDigitTolerance } = options
	if (!isNumber(absoluteTolerance) || absoluteTolerance < 0) throw new Error(`Invalid FloatEqualityOptions: absoluteTolerance must be a non-negative number, but received "${absoluteTolerance}".`)
	if (!isNumber(relativeTolerance) || relativeTolerance < 0) throw new Error(`Invalid FloatEqualityOptions: relativeTolerance must be a non-negative number, but received "${relativeTolerance}".`)
	if (significantDigitTolerance !== Infinity && (!isInt(significantDigitTolerance) || significantDigitTolerance < 0)) throw new Error(`Invalid FloatEqualityOptions: significantDigitTolerance must be a non-negative integer, but received "${significantDigitTolerance}".`)
	return options
}

export function getNumberDirection(input: number, reference: number): -1 | 0 | 1 {
	return input > reference ? 1 : input < reference ? -1 : 0
}

export function getRelativeDifference(input: number, reference: number): number {
	const max = Math.max(Math.abs(input), Math.abs(reference))
	return max === 0 ? 0 : Math.abs(input - reference) / max
}
