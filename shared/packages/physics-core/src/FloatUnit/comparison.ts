import { mergeDefaults } from '@step-wise/utils'

import { type FloatEqualityOptions, type FloatEqualityOptionsInput, type FloatEqualityResult, defaultFloatEqualityOptions, resolveFloatEqualityOptions } from '../Float'
import { type Unit, type UnitEqualityOptions, type UnitEqualityOptionsInput, type UnitEqualityResult, defaultUnitEqualityOptions, resolveUnitEqualityOptions } from '../Unit'

export type FloatUnitEqualityOptions = {
	float: FloatEqualityOptions
	unit: UnitEqualityOptions
}

export type FloatUnitEqualityOptionsInput = {
	float?: FloatEqualityOptionsInput
	unit?: UnitEqualityOptionsInput
}

export const defaultFloatUnitEqualityOptions = {
	float: defaultFloatEqualityOptions,
	unit: { ...defaultUnitEqualityOptions, checkSize: false }, // Don't check unit size, since this is now done through the float.
} satisfies FloatUnitEqualityOptions

export function resolveFloatUnitEqualityOptions(options: FloatUnitEqualityOptionsInput = {}): FloatUnitEqualityOptions {
	const settings = mergeDefaults(options, defaultFloatUnitEqualityOptions)
	return {
		float: resolveFloatEqualityOptions(settings.float),
		unit: resolveUnitEqualityOptions(settings.unit),
	}
}

export type FloatUnitEqualityResult = {
	equal: boolean
	float: FloatEqualityResult
	unit: UnitEqualityResult<Unit>
}
