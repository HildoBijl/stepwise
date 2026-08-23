import { type RandomExponentialFloatOptions, type RandomExponentialFloatOptionsInput, type RandomFloatOptions, type RandomFloatOptionsInput, getRandomExponentialFloat, getRandomFloat, resolveRandomExponentialFloatOptions, resolveRandomFloatOptions } from '../Float'
import { type UnitInput, Unit, asUnit } from '../Unit'

import { FloatUnit } from './FloatUnit'

export type RandomFloatUnitOptions = RandomFloatOptions & { unit: Unit }
export type RandomFloatUnitOptionsInput = RandomFloatOptionsInput & { unit: UnitInput }
export type RandomExponentialFloatUnitOptions = RandomExponentialFloatOptions & { unit: Unit }
export type RandomExponentialFloatUnitOptionsInput = RandomExponentialFloatOptionsInput & { unit: UnitInput }

export function resolveRandomFloatUnitOptions(options: RandomFloatUnitOptionsInput): RandomFloatUnitOptions {
	const { unit, ...floatOptions } = options
	return { ...resolveRandomFloatOptions(floatOptions), unit: asUnit(unit) }
}

export function resolveRandomExponentialFloatUnitOptions(options: RandomExponentialFloatUnitOptionsInput): RandomExponentialFloatUnitOptions {
	const { unit, ...floatOptions } = options
	return { ...resolveRandomExponentialFloatOptions(floatOptions), unit: asUnit(unit) }
}

export function getRandomFloatUnit(options: RandomFloatUnitOptionsInput): FloatUnit {
	const { unit, ...floatOptions } = resolveRandomFloatUnitOptions(options)
	return new FloatUnit({
		float: getRandomFloat(floatOptions),
		unit,
	})
}

export function getRandomExponentialFloatUnit(options: RandomExponentialFloatUnitOptionsInput): FloatUnit {
	const { unit, ...floatOptions } = resolveRandomExponentialFloatUnitOptions(options)
	return new FloatUnit({
		float: getRandomExponentialFloat(floatOptions),
		unit,
	})
}
