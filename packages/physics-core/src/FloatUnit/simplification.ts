import { mergeDefaults } from '@step-wise/js-utils'

import { type UnitSimplificationOptions, type UnitSimplificationOptionsInput, defaultUnitSimplificationOptions } from '../Unit'

export type FloatUnitSimplificationOptions = UnitSimplificationOptions & { simplifyFloat: boolean }
export type FloatUnitSimplificationOptionsInput = UnitSimplificationOptionsInput & { simplifyFloat?: boolean }

export const defaultFloatUnitSimplificationOptions = {
	...defaultUnitSimplificationOptions,
	simplifyFloat: true,
} satisfies FloatUnitSimplificationOptions

export function resolveFloatUnitSimplificationOptions(options: FloatUnitSimplificationOptionsInput = {}): FloatUnitSimplificationOptions {
	return mergeDefaults(options, defaultFloatUnitSimplificationOptions)
}
