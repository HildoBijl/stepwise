import { mergeDefaults } from '@step-wise/js-utils'

import { type PrecisionNumberEqualityOptions, type PrecisionNumberEqualityOptionsInput, type PrecisionNumberEqualityResult, defaultPrecisionNumberEqualityOptions, resolvePrecisionNumberEqualityOptions, adjustPrecisionNumberTolerances } from '../PrecisionNumber'
import { type Unit, type UnitEqualityOptions, type UnitEqualityOptionsInput, type UnitEqualityResult, defaultUnitEqualityOptions, resolveUnitEqualityOptions } from '../Unit'

export type FloatUnitEqualityOptions = {
	value: PrecisionNumberEqualityOptions
	unit: UnitEqualityOptions
}

export type FloatUnitEqualityOptionsInput = {
	value?: PrecisionNumberEqualityOptionsInput
	unit?: UnitEqualityOptionsInput
}

export const defaultFloatUnitEqualityOptions = {
	value: defaultPrecisionNumberEqualityOptions,
	unit: { ...defaultUnitEqualityOptions, checkSize: false }, // Don't check unit size, since this is now done through the value.
} satisfies FloatUnitEqualityOptions

export function resolveFloatUnitEqualityOptions(options: FloatUnitEqualityOptionsInput = {}, minimumAbsoluteTolerance: number): FloatUnitEqualityOptions {
	const settings = mergeDefaults(options, defaultFloatUnitEqualityOptions)
	return {
		value: resolvePrecisionNumberEqualityOptions(settings.value, minimumAbsoluteTolerance),
		unit: resolveUnitEqualityOptions(mergeDefaults(settings.unit, defaultFloatUnitEqualityOptions.unit)),
	}
}

export function adjustFloatUnitTolerances(options: FloatUnitEqualityOptionsInput, factor: number, minimumAbsoluteTolerance: number) {
	const equalityOptions = resolveFloatUnitEqualityOptions(options, minimumAbsoluteTolerance)
	return { ...equalityOptions, value: adjustPrecisionNumberTolerances(equalityOptions.value, factor, minimumAbsoluteTolerance) }
}

export type FloatUnitEqualityResult = {
	equal: boolean
	value: PrecisionNumberEqualityResult
	unit: UnitEqualityResult<Unit>
}
