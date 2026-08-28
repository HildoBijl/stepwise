import { ensureBoolean, mergeDefaults } from '@step-wise/js-utils'

import { type UnitTransformationData, type UnitSimplificationTarget, resolveUnitSimplificationOptions } from './simplification.ts'

export type UnitEqualityOptions = {
	target: UnitSimplificationTarget
	combine: boolean
	sort: boolean
	checkSize: boolean
}
export type UnitEqualityOptionsInput = Partial<UnitEqualityOptions>

export const defaultUnitEqualityOptions = {
	target: 'base',
	combine: true,
	sort: true,
	checkSize: true,
} satisfies UnitEqualityOptions

export function resolveUnitEqualityOptions(options: UnitEqualityOptionsInput = {}): UnitEqualityOptions {
	const resolved = mergeDefaults(options, defaultUnitEqualityOptions)
	const simplification = resolveUnitSimplificationOptions({ target: resolved.target, combine: resolved.combine, sort: resolved.sort })
	return { ...simplification, checkSize: ensureBoolean(resolved.checkSize) }
}

export type UnitEqualityResult<TUnit> = {
	equal: boolean
	form: {
		equal: boolean
		input: TUnit
		reference: TUnit
	}
	size: {
		equal: boolean
		decimalExponentDifference: number
		factorRatio: number
		offsetDifference: number
	}
}

export function compareUnitTransformationSize<TUnit>(input: UnitTransformationData<TUnit>, reference: UnitTransformationData<TUnit>) {
	const decimalExponentDifference = input.decimalExponent - reference.decimalExponent
	const factorRatio = input.factor / reference.factor
	const offsetDifference = input.offset - reference.offset
	return {
		equal: decimalExponentDifference === 0 && factorRatio === 1 && offsetDifference === 0,
		decimalExponentDifference,
		factorRatio,
		offsetDifference,
	}
}
