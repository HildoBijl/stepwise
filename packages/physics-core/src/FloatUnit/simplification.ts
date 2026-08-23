import { ensureBoolean, mergeDefaults } from '@step-wise/js-utils'

import { type UnitSimplificationOptions, type UnitSimplificationOptionsInput, defaultUnitSimplificationOptions, resolveUnitSimplificationOptions } from '../Unit'

export type FloatUnitSimplificationOptions = UnitSimplificationOptions & { simplifyPrecisionNumber: boolean }
export type FloatUnitSimplificationOptionsInput = UnitSimplificationOptionsInput & { simplifyPrecisionNumber?: boolean }

export const defaultFloatUnitSimplificationOptions = {
	...defaultUnitSimplificationOptions,
	simplifyPrecisionNumber: true,
} satisfies FloatUnitSimplificationOptions

export function resolveFloatUnitSimplificationOptions(options: FloatUnitSimplificationOptionsInput = {}): FloatUnitSimplificationOptions {
	const resolved = mergeDefaults(options, defaultFloatUnitSimplificationOptions)
	const unitOptions = resolveUnitSimplificationOptions({ target: resolved.target, combine: resolved.combine, sort: resolved.sort })
	return { ...unitOptions, simplifyPrecisionNumber: ensureBoolean(resolved.simplifyPrecisionNumber) }
}
