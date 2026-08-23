import { type RandomExponentialPrecisionNumberOptions, type RandomExponentialPrecisionNumberOptionsInput, type RandomPrecisionNumberOptions, type RandomPrecisionNumberOptionsInput, getRandomExponentialPrecisionNumber, getRandomPrecisionNumber, resolveRandomExponentialPrecisionNumberOptions, resolveRandomPrecisionNumberOptions } from '../PrecisionNumber'
import { type UnitInput, Unit, asUnit } from '../Unit'

import { FloatUnit } from './FloatUnit'

export type RandomFloatUnitOptions = RandomPrecisionNumberOptions & { unit: Unit }
export type RandomFloatUnitOptionsInput = RandomPrecisionNumberOptionsInput & { unit: UnitInput }
export type RandomExponentialFloatUnitOptions = RandomExponentialPrecisionNumberOptions & { unit: Unit }
export type RandomExponentialFloatUnitOptionsInput = RandomExponentialPrecisionNumberOptionsInput & { unit: UnitInput }

export function resolveRandomFloatUnitOptions(options: RandomFloatUnitOptionsInput): RandomFloatUnitOptions {
	const { unit, ...precisionNumberOptions } = options
	return { ...resolveRandomPrecisionNumberOptions(precisionNumberOptions), unit: asUnit(unit) }
}

export function resolveRandomExponentialFloatUnitOptions(options: RandomExponentialFloatUnitOptionsInput): RandomExponentialFloatUnitOptions {
	const { unit, ...precisionNumberOptions } = options
	return { ...resolveRandomExponentialPrecisionNumberOptions(precisionNumberOptions), unit: asUnit(unit) }
}

export function getRandomFloatUnit(options: RandomFloatUnitOptionsInput): FloatUnit {
	const { unit, ...precisionNumberOptions } = resolveRandomFloatUnitOptions(options)
	return new FloatUnit({
		value: getRandomPrecisionNumber(precisionNumberOptions),
		unit,
	})
}

export function getRandomExponentialFloatUnit(options: RandomExponentialFloatUnitOptionsInput): FloatUnit {
	const { unit, ...precisionNumberOptions } = resolveRandomExponentialFloatUnitOptions(options)
	return new FloatUnit({
		value: getRandomExponentialPrecisionNumber(precisionNumberOptions),
		unit,
	})
}
