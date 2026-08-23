import { type NumberEqualityOptions, type NumberEqualityResult, mergeDefaults, pickFromDefaults, isInteger, ensureBoolean, ensureNumber, defaultNumberEqualityOptions, adjustNumberTolerances, validateNumberEqualityOptions } from '@step-wise/js-utils'

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
	minimumAbsoluteTolerance = ensureNumber(minimumAbsoluteTolerance, { nonNegative: true })
	const resolved = mergeDefaults(options, defaultFloatEqualityOptions)
	validateFloatEqualityOptions(resolved)
	return applyMinimumAbsoluteTolerance(resolved, minimumAbsoluteTolerance)
}

export function validateFloatEqualityOptions(options: FloatEqualityOptions): void {
	validateNumberEqualityOptions(options)
	const { significantDigitTolerance, checkPower } = options
	if (significantDigitTolerance !== Infinity && (!isInteger(significantDigitTolerance) || significantDigitTolerance < 0)) throw new Error(`Invalid FloatEqualityOptions: significantDigitTolerance must be a non-negative integer, but received "${significantDigitTolerance}".`)
	ensureBoolean(checkPower)
}

export function applyMinimumAbsoluteTolerance(options: FloatEqualityOptions, minimumAbsoluteTolerance: number) {
	minimumAbsoluteTolerance = ensureNumber(minimumAbsoluteTolerance, { nonNegative: true })
	return { ...options, absoluteTolerance: Math.max(options.absoluteTolerance, minimumAbsoluteTolerance) }
}

export function adjustFloatTolerances(options: FloatEqualityOptionsInput, factor: number, minimumAbsoluteTolerance: number) {
	factor = ensureNumber(factor, { nonNegative: true, nonZero: true })
	const equalityOptions = resolveFloatEqualityOptions(options, minimumAbsoluteTolerance)
	return applyMinimumAbsoluteTolerance({
		...equalityOptions,
		...adjustNumberTolerances(pickFromDefaults(equalityOptions, defaultNumberEqualityOptions), factor),
	}, minimumAbsoluteTolerance)
}
