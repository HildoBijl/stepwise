import { mergeDefaults } from '@step-wise/js-utils'

import { type FloatEqualityOptions, type FloatEqualityOptionsInput, type FloatEqualityResult, defaultFloatEqualityOptions, resolveFloatEqualityOptions, adjustFloatTolerances } from '../Float'
import { type Unit, type UnitEqualityOptions, type UnitEqualityOptionsInput, type UnitEqualityResult, defaultUnitEqualityOptions, resolveUnitEqualityOptions } from '../Unit'

export type FloatUnitEqualityOptions = {
	value: FloatEqualityOptions
	unit: UnitEqualityOptions
}

export type FloatUnitEqualityOptionsInput = {
	value?: FloatEqualityOptionsInput
	unit?: UnitEqualityOptionsInput
}

export const defaultFloatUnitEqualityOptions = {
	value: defaultFloatEqualityOptions,
	unit: { ...defaultUnitEqualityOptions, checkSize: false }, // Don't check unit size, since this is now done through the value.
} satisfies FloatUnitEqualityOptions

export function resolveFloatUnitEqualityOptions(options: FloatUnitEqualityOptionsInput = {}, minimumAbsoluteTolerance: number): FloatUnitEqualityOptions {
	const settings = mergeDefaults(options, defaultFloatUnitEqualityOptions)
	return {
		value: resolveFloatEqualityOptions(settings.value, minimumAbsoluteTolerance),
		unit: resolveUnitEqualityOptions(mergeDefaults(settings.unit, defaultFloatUnitEqualityOptions.unit)),
	}
}

export function adjustFloatUnitTolerances(options: FloatUnitEqualityOptionsInput, factor: number, minimumAbsoluteTolerance: number) {
	const equalityOptions = resolveFloatUnitEqualityOptions(options, minimumAbsoluteTolerance)
	return { ...equalityOptions, value: adjustFloatTolerances(equalityOptions.value, factor, minimumAbsoluteTolerance) }
}

export type FloatUnitEqualityResult = {
	equal: boolean
	value: FloatEqualityResult
	unit: UnitEqualityResult<Unit>
}
