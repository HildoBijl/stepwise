import { ensureBoolean, mergeDefaults } from '@step-wise/js-utils'

import { type UnitFactor } from '../UnitFactor/index.ts'

/*
 * Simplification targets: to what depth/form do we simplify units?
 */

export const unitSimplificationTargets = ['unchanged', 'normalizedPrefixes', 'standard', 'base'] as const
export type UnitSimplificationTarget = typeof unitSimplificationTargets[number]

/*
 * Simplification options: what are the full options for simplifying units?
 */

export type UnitSimplificationOptions = {
	target: UnitSimplificationTarget
	combine: boolean
	sort: boolean
}
export type UnitSimplificationOptionsInput = Partial<UnitSimplificationOptions>

export const defaultUnitSimplificationOptions = {
	target: 'standard',
	combine: true,
	sort: true,
} satisfies UnitSimplificationOptions

export function resolveUnitSimplificationOptions(options: UnitSimplificationOptionsInput = {}): UnitSimplificationOptions {
	const resolved = mergeDefaults(options, defaultUnitSimplificationOptions)
	if (!unitSimplificationTargets.includes(resolved.target)) throw new RangeError(`Invalid unit simplification target "${resolved.target}".`)
	return { target: resolved.target, combine: ensureBoolean(resolved.combine), sort: ensureBoolean(resolved.sort) }
}

/*
 * Transformations upon simplifying: how does a quantity change when its units are written differently?
 */

export type UnitTransformationData<TUnit> = {
	unit: TUnit
	decimalExponent: number
	factor: number
	offset: number
}

/*
 * Sorting: how do we order the unit factors inside a unit?
 */

// For sorting, compare two unit factors and determine which should come earlier.
export function compareUnitFactors(a: UnitFactor, b: UnitFactor): number {
	if (a.unit.order !== b.unit.order) return a.unit.order - b.unit.order
	if (a.unit.symbol !== b.unit.symbol) return a.unit.symbol.toLowerCase() > b.unit.symbol.toLowerCase() ? 1 : -1
	const prefixExponentA = a.prefix?.exponent ?? 0
	const prefixExponentB = b.prefix?.exponent ?? 0
	if (prefixExponentA !== prefixExponentB) return prefixExponentA - prefixExponentB
	return 0
}
