import { type NumberEqualityOptions, type NumberEqualityResult, mergeDefaults, pickFromDefaults, isInteger, ensureNumber, defaultNumberEqualityOptions, adjustNumberTolerances } from '@step-wise/utils'

export type FloatEqualityOptions = NumberEqualityOptions & {
	significantDigitTolerance: number
	checkPower: boolean
}
export type FloatEqualityOptionsInput = Partial<FloatEqualityOptions>

export const defaultFloatEqualityOptions: FloatEqualityOptions = {
	...defaultNumberEqualityOptions,
	significantDigitTolerance: Infinity,
	checkPower: false,
}

export type FloatEqualityResult = {
	equal: boolean
	number: NumberEqualityResult
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

export function resolveFloatEqualityOptions(options: FloatEqualityOptionsInput = {}, minimumAbsoluteTolerance: number): FloatEqualityOptions {
	return applyMinimumAbsoluteTolerance(validateFloatEqualityOptions(mergeDefaults(options, defaultFloatEqualityOptions)), minimumAbsoluteTolerance)
}

export function validateFloatEqualityOptions(options: FloatEqualityOptions): FloatEqualityOptions {
	const { absoluteTolerance, relativeTolerance, significantDigitTolerance } = options
	if (absoluteTolerance < 0) throw new Error(`Invalid FloatEqualityOptions: absoluteTolerance must be a non-negative number, but received "${absoluteTolerance}".`)
	if (relativeTolerance < 0) throw new Error(`Invalid FloatEqualityOptions: relativeTolerance must be a non-negative number, but received "${relativeTolerance}".`)
	if (significantDigitTolerance !== Infinity && (!isInteger(significantDigitTolerance) || significantDigitTolerance < 0)) throw new Error(`Invalid FloatEqualityOptions: significantDigitTolerance must be a non-negative integer, but received "${significantDigitTolerance}".`)
	return options
}

export function applyMinimumAbsoluteTolerance(options: FloatEqualityOptions, minimumAbsoluteTolerance: number) {
	return { ...options, absoluteTolerance: Math.max(options.absoluteTolerance, minimumAbsoluteTolerance) }
}

export function adjustFloatTolerances(options: FloatEqualityOptionsInput, factor: number, minimumAbsoluteTolerance: number) {
	const equalityOptions = resolveFloatEqualityOptions(options, minimumAbsoluteTolerance)
	return applyMinimumAbsoluteTolerance({
		...equalityOptions,
		...adjustNumberTolerances(pickFromDefaults(equalityOptions, defaultNumberEqualityOptions), factor),
	}, minimumAbsoluteTolerance)
}
