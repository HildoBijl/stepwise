import { hasOnlyKeys, isPlainObject, mergeDefaults } from '@step-wise/js-utils'

import { type PrecisionNumberEqualityOptions, type PrecisionNumberEqualityOptionsInput, type PrecisionNumberEqualityResult, defaultPrecisionNumberEqualityOptions, isPrecisionNumberEqualityOptionsInput, resolvePrecisionNumberEqualityOptions, adjustPrecisionNumberTolerances } from '../PrecisionNumber/index.ts'
import { type Unit, type UnitEqualityOptions, type UnitEqualityOptionsInput, type UnitEqualityResult, defaultUnitEqualityOptions, isUnitEqualityOptionsInput, resolveUnitEqualityOptions } from '../Unit/index.ts'

export type QuantityEqualityOptions = {
	value: PrecisionNumberEqualityOptions
	unit: UnitEqualityOptions
}

export type QuantityEqualityOptionsInput = {
	value?: PrecisionNumberEqualityOptionsInput
	unit?: UnitEqualityOptionsInput
}

export const defaultQuantityEqualityOptions = {
	value: defaultPrecisionNumberEqualityOptions,
	unit: { ...defaultUnitEqualityOptions, checkSize: false }, // Don't check unit size, since this is now done through the value.
} satisfies QuantityEqualityOptions

export function isQuantityEqualityOptionsInput(value: unknown): value is QuantityEqualityOptionsInput {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['value', 'unit'])) return false
	return (value.value === undefined || isPrecisionNumberEqualityOptionsInput(value.value))
		&& (value.unit === undefined || isUnitEqualityOptionsInput(value.unit))
}

export function resolveQuantityEqualityOptions(options: QuantityEqualityOptionsInput = {}, minimumAbsoluteTolerance: number): QuantityEqualityOptions {
	const settings = mergeDefaults(options, defaultQuantityEqualityOptions)
	return {
		value: resolvePrecisionNumberEqualityOptions(settings.value, minimumAbsoluteTolerance),
		unit: resolveUnitEqualityOptions(mergeDefaults(settings.unit, defaultQuantityEqualityOptions.unit)),
	}
}

export function adjustQuantityTolerances(options: QuantityEqualityOptionsInput, factor: number, minimumAbsoluteTolerance: number) {
	const equalityOptions = resolveQuantityEqualityOptions(options, minimumAbsoluteTolerance)
	return { ...equalityOptions, value: adjustPrecisionNumberTolerances(equalityOptions.value, factor, minimumAbsoluteTolerance) }
}

export type QuantityEqualityResult = {
	equal: boolean
	value: PrecisionNumberEqualityResult
	unit: UnitEqualityResult<Unit>
}
