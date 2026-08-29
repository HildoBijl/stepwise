import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

import { deserializePrecisionNumber, isSerializedPrecisionNumber, PrecisionNumberType } from '../PrecisionNumber/index.ts'
import { deserializeUnit, isSerializedUnit, UnitType } from '../Unit/index.ts'

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
	if (!isPlainObject(serializedQuantity) || !hasOnlyKeys(serializedQuantity, ['type', 'value']) || serializedQuantity.type !== QuantityType || !Object.hasOwn(serializedQuantity, 'value')) throw new TypeError(`Invalid serialized Quantity: expected its type and value.`)
	const value = serializedQuantity.value
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['value', 'unit']) || !Object.hasOwn(value, 'value') || !Object.hasOwn(value, 'unit')) throw new TypeError(`Invalid QuantityStorageValue: expected an object containing value and unit.`)
	return new Quantity({
		value: deserializePrecisionNumber({ type: PrecisionNumberType, value: value.value }),
		unit: deserializeUnit({ type: UnitType, value: value.unit }),
	})
}
