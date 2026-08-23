import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

import { type PrecisionNumberStorageValue, PrecisionNumberType } from './interpreting'
import { PrecisionNumber } from './PrecisionNumber'

export type SerializedPrecisionNumber = {
	type: PrecisionNumberType
	value: PrecisionNumberStorageValue
}

export function serializePrecisionNumber(precisionNumber: PrecisionNumber): SerializedPrecisionNumber {
	return {
		type: PrecisionNumberType,
		value: precisionNumber.toStorageValue(),
	}
}

export function deserializePrecisionNumber(serializedPrecisionNumber: unknown): PrecisionNumber {
	if (!isPlainObject(serializedPrecisionNumber) || !hasOnlyKeys(serializedPrecisionNumber, ['type', 'value']) || serializedPrecisionNumber.type !== PrecisionNumberType || !Object.hasOwn(serializedPrecisionNumber, 'value')) throw new TypeError(`Invalid serialized PrecisionNumber: expected type "${PrecisionNumberType}" and a value.`)
	return new PrecisionNumber(serializedPrecisionNumber.value as PrecisionNumberStorageValue)
}
