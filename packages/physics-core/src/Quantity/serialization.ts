import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

import { deserializePrecisionNumber, PrecisionNumberType } from '../PrecisionNumber/index.ts'
import { deserializeUnit, UnitType } from '../Unit/index.ts'

import { type QuantityStorageValue, QuantityType } from './interpreting.ts'
import { Quantity } from './Quantity.ts'

export type SerializedQuantity = {
	type: QuantityType
	value: QuantityStorageValue
}

export function serializeQuantity(quantity: Quantity): SerializedQuantity {
	return {
		type: QuantityType,
		value: quantity.toStorageValue(),
	}
}

export function deserializeQuantity(serializedQuantity: unknown): Quantity {
	if (!isPlainObject(serializedQuantity) || !hasOnlyKeys(serializedQuantity, ['type', 'value']) || serializedQuantity.type !== QuantityType || !Object.hasOwn(serializedQuantity, 'value')) throw new TypeError(`Invalid serialized Quantity: expected type "${QuantityType}" and a value.`)
	const value = serializedQuantity.value
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['value', 'unit']) || !Object.hasOwn(value, 'value') || !Object.hasOwn(value, 'unit')) throw new TypeError(`Invalid QuantityStorageValue: expected an object containing "value" and "unit".`)
	return new Quantity({
		value: deserializePrecisionNumber({ type: PrecisionNumberType, value: value.value }),
		unit: deserializeUnit({ type: UnitType, value: value.unit }),
	})
}
