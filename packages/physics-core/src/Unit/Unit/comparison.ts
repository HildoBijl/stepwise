import { mergeDefaults } from '@step-wise/utils'

import { type UnitTransformationData, type UnitSimplificationTarget } from './simplification'

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
	return mergeDefaults(options, defaultUnitEqualityOptions)
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
		exponentDifference: number
		factorRatio: number
		differenceDifference: number
	}
}

export function compareUnitTransformationSize<TUnit>(input: UnitTransformationData<TUnit>, reference: UnitTransformationData<TUnit>) {
	const exponentDifference = input.exponent - reference.exponent
	const factorRatio = input.factor / reference.factor
	const differenceDifference = input.difference - reference.difference
	return {
		equal: exponentDifference === 0 && factorRatio === 1 && differenceDifference === 0,
		exponentDifference,
		factorRatio,
		differenceDifference,
	}
}
