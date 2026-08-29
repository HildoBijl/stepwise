import { type NumberEqualityOptions, type NumberEqualityResult, mergeDefaults, pickFromDefaults, hasOnlyKeys, isPlainObject, isInteger, isNumberEqualityOptionsInput, ensureBoolean, ensureNumber, defaultNumberEqualityOptions, adjustNumberTolerances, validateNumberEqualityOptions } from '@step-wise/js-utils'

export type PrecisionNumberEqualityOptions = NumberEqualityOptions & {
	significantDigitTolerance: number
	checkPower: boolean
}
export type PrecisionNumberEqualityOptionsInput = Partial<PrecisionNumberEqualityOptions>

export const defaultPrecisionNumberEqualityOptions: PrecisionNumberEqualityOptions = {
	...defaultNumberEqualityOptions,
	significantDigitTolerance: Infinity,
	checkPower: false,
}

export function isPrecisionNumberEqualityOptionsInput(value: unknown): value is PrecisionNumberEqualityOptionsInput {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['absoluteTolerance', 'relativeTolerance', 'significantDigitTolerance', 'checkPower'])) return false
	const { absoluteTolerance, relativeTolerance, significantDigitTolerance, checkPower } = value
	return isNumberEqualityOptionsInput({ absoluteTolerance, relativeTolerance })
		&& (significantDigitTolerance === undefined || significantDigitTolerance === Infinity || (isInteger(significantDigitTolerance) && significantDigitTolerance >= 0))
		&& (checkPower === undefined || typeof checkPower === 'boolean')
}

export type PrecisionNumberEqualityResult = {
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

export function resolvePrecisionNumberEqualityOptions(options: PrecisionNumberEqualityOptionsInput = {}, minimumAbsoluteTolerance: number): PrecisionNumberEqualityOptions {
	minimumAbsoluteTolerance = ensureNumber(minimumAbsoluteTolerance, { nonNegative: true })
	const resolved = mergeDefaults(options, defaultPrecisionNumberEqualityOptions)
	validatePrecisionNumberEqualityOptions(resolved)
	return applyMinimumAbsoluteTolerance(resolved, minimumAbsoluteTolerance)
}

export function validatePrecisionNumberEqualityOptions(options: PrecisionNumberEqualityOptions): void {
	validateNumberEqualityOptions(options)
	const { significantDigitTolerance, checkPower } = options
	if (significantDigitTolerance !== Infinity && (!isInteger(significantDigitTolerance) || significantDigitTolerance < 0)) throw new Error(`Invalid PrecisionNumberEqualityOptions: significantDigitTolerance must be a non-negative integer, but received "${significantDigitTolerance}".`)
	ensureBoolean(checkPower)
}

export function applyMinimumAbsoluteTolerance(options: PrecisionNumberEqualityOptions, minimumAbsoluteTolerance: number) {
	minimumAbsoluteTolerance = ensureNumber(minimumAbsoluteTolerance, { nonNegative: true })
	return { ...options, absoluteTolerance: Math.max(options.absoluteTolerance, minimumAbsoluteTolerance) }
}

export function adjustPrecisionNumberTolerances(options: PrecisionNumberEqualityOptionsInput, factor: number, minimumAbsoluteTolerance: number) {
	factor = ensureNumber(factor, { nonNegative: true, nonZero: true })
	const equalityOptions = resolvePrecisionNumberEqualityOptions(options, minimumAbsoluteTolerance)
	return applyMinimumAbsoluteTolerance({
		...equalityOptions,
		...adjustNumberTolerances(pickFromDefaults(equalityOptions, defaultNumberEqualityOptions), factor),
	}, minimumAbsoluteTolerance)
}
