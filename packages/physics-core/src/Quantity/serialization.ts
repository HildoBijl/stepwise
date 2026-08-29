import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

import { isSerializedPrecisionNumber, PrecisionNumberType } from '../PrecisionNumber/index.ts'
import { isSerializedUnit, UnitType } from '../Unit/index.ts'

import { type QuantityStorageValue, QuantityType } from './interpreting.ts'
import { Quantity } from './Quantity.ts'

export type SerializedQuantity = {
	type: QuantityType
	value: QuantityStorageValue
}

export function isSerializedQuantity(value: unknown): value is SerializedQuantity {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['type', 'value']) || value.type !== QuantityType || !Object.hasOwn(value, 'value')) return false
	const storageValue = value.value
	return isPlainObject(storageValue) && hasOnlyKeys(storageValue, ['value', 'unit']) && Object.hasOwn(storageValue, 'value') && Object.hasOwn(storageValue, 'unit') && isSerializedPrecisionNumber({ type: PrecisionNumberType, value: storageValue.value }) && isSerializedUnit({ type: UnitType, value: storageValue.unit })
}

export function serializeQuantity(quantity: Quantity): SerializedQuantity {
	return {
		type: QuantityType,
		value: quantity.toStorageValue(),
	}
}

export function deserializeQuantity(serializedQuantity: unknown): Quantity {
	if (!isSerializedQuantity(serializedQuantity)) throw new TypeError(`Invalid serialized Quantity.`)
	return new Quantity(serializedQuantity.value)
}
