import { ensureBoolean, mergeDefaults } from '@step-wise/js-utils'

import { type UnitSimplificationOptions, type UnitSimplificationOptionsInput, defaultUnitSimplificationOptions, resolveUnitSimplificationOptions } from '../Unit'

export type FloatUnitSimplificationOptions = UnitSimplificationOptions & { simplifyFloat: boolean }
export type FloatUnitSimplificationOptionsInput = UnitSimplificationOptionsInput & { simplifyFloat?: boolean }

export const defaultFloatUnitSimplificationOptions = {
	...defaultUnitSimplificationOptions,
	simplifyFloat: true,
} satisfies FloatUnitSimplificationOptions

export function resolveFloatUnitSimplificationOptions(options: FloatUnitSimplificationOptionsInput = {}): FloatUnitSimplificationOptions {
	const resolved = mergeDefaults(options, defaultFloatUnitSimplificationOptions)
	const unitOptions = resolveUnitSimplificationOptions({ target: resolved.target, combine: resolved.combine, sort: resolved.sort })
	return { ...unitOptions, simplifyFloat: ensureBoolean(resolved.simplifyFloat) }
}
