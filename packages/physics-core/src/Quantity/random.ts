import { type RandomExponentialPrecisionNumberOptions, type RandomExponentialPrecisionNumberOptionsInput, type RandomPrecisionNumberOptions, type RandomPrecisionNumberOptionsInput, getRandomExponentialPrecisionNumber, getRandomPrecisionNumber, resolveRandomExponentialPrecisionNumberOptions, resolveRandomPrecisionNumberOptions } from '../PrecisionNumber/index.ts'
import { type UnitInput, Unit, asUnit } from '../Unit/index.ts'

import { Quantity } from './Quantity.ts'

export type RandomQuantityOptions = RandomPrecisionNumberOptions & { unit: Unit }
export type RandomQuantityOptionsInput = RandomPrecisionNumberOptionsInput & { unit: UnitInput }
export type RandomExponentialQuantityOptions = RandomExponentialPrecisionNumberOptions & { unit: Unit }
export type RandomExponentialQuantityOptionsInput = RandomExponentialPrecisionNumberOptionsInput & { unit: UnitInput }

export function resolveRandomQuantityOptions(options: RandomQuantityOptionsInput): RandomQuantityOptions {
	const { unit, ...precisionNumberOptions } = options
	return { ...resolveRandomPrecisionNumberOptions(precisionNumberOptions), unit: asUnit(unit) }
}

export function resolveRandomExponentialQuantityOptions(options: RandomExponentialQuantityOptionsInput): RandomExponentialQuantityOptions {
	const { unit, ...precisionNumberOptions } = options
	return { ...resolveRandomExponentialPrecisionNumberOptions(precisionNumberOptions), unit: asUnit(unit) }
}

export function getRandomQuantity(options: RandomQuantityOptionsInput): Quantity {
	const { unit, ...precisionNumberOptions } = resolveRandomQuantityOptions(options)
	return new Quantity({
		value: getRandomPrecisionNumber(precisionNumberOptions),
		unit,
	})
}

export function getRandomExponentialQuantity(options: RandomExponentialQuantityOptionsInput): Quantity {
	const { unit, ...precisionNumberOptions } = resolveRandomExponentialQuantityOptions(options)
	return new Quantity({
		value: getRandomExponentialPrecisionNumber(precisionNumberOptions),
		unit,
	})
}
