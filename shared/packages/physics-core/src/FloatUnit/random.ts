import { getRandomExponentialFloat, getRandomFloat, type RandomExponentialFloatOptions, type RandomFloatOptions } from '../Float'
import { type UnitInput } from '../Unit'

import { FloatUnit } from './FloatUnit'

export type RandomFloatUnitOptions = RandomFloatOptions & { unit: UnitInput }
export type RandomExponentialFloatUnitOptions = RandomExponentialFloatOptions & { unit: UnitInput }

export function getRandomFloatUnit(options: RandomFloatUnitOptions): FloatUnit {
	const { unit, ...floatOptions } = options
	return new FloatUnit({
		float: getRandomFloat(floatOptions),
		unit: unit,
	})
}

export function getRandomExponentialFloatUnit(options: RandomExponentialFloatUnitOptions): FloatUnit {
	const { unit, ...floatOptions } = options
	return new FloatUnit({
		float: getRandomExponentialFloat(floatOptions),
		unit: unit,
	})
}
