import { ensureBoolean, mergeDefaults } from '@step-wise/js-utils'

import { type UnitElement } from '../UnitElement'

/*
 * Simplification targets: to what depth/form do we simplify units?
 */

export const unitSimplificationTargets = ['unchanged', 'noPrefixes', 'standard', 'base'] as const
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
	exponent: number
	factor: number
	difference: number
}

/*
 * Sorting: how do we order the unit elements inside a unit?
 */

// For sorting, compare two unit elements and determine which should come earlier.
export function compareUnitElements(a: UnitElement, b: UnitElement): number {
	if (a.unit.order !== b.unit.order) return a.unit.order - b.unit.order
	if (a.unit.letter !== b.unit.letter) return a.unit.letter.toLowerCase() > b.unit.letter.toLowerCase() ? 1 : -1
	const prefixExponentA = a.prefix?.exponent ?? 0
	const prefixExponentB = b.prefix?.exponent ?? 0
	if (prefixExponentA !== prefixExponentB) return prefixExponentA - prefixExponentB
	return 0
}
