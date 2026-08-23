import { ensureBoolean, mergeDefaults } from '@step-wise/js-utils'

import { type UnitSimplificationOptions, type UnitSimplificationOptionsInput, defaultUnitSimplificationOptions, resolveUnitSimplificationOptions } from '../Unit'

export type QuantitySimplificationOptions = UnitSimplificationOptions & { simplifyPrecisionNumber: boolean }
export type QuantitySimplificationOptionsInput = UnitSimplificationOptionsInput & { simplifyPrecisionNumber?: boolean }

export const defaultQuantitySimplificationOptions = {
	...defaultUnitSimplificationOptions,
	simplifyPrecisionNumber: true,
} satisfies QuantitySimplificationOptions

export function resolveQuantitySimplificationOptions(options: QuantitySimplificationOptionsInput = {}): QuantitySimplificationOptions {
	const resolved = mergeDefaults(options, defaultQuantitySimplificationOptions)
	const unitOptions = resolveUnitSimplificationOptions({ target: resolved.target, combine: resolved.combine, sort: resolved.sort })
	return { ...unitOptions, simplifyPrecisionNumber: ensureBoolean(resolved.simplifyPrecisionNumber) }
}
