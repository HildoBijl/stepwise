import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

import { type PrecisionNumberStorageValue, ensurePrecisionNumberStorageValue, PrecisionNumberType } from './interpreting.ts'
import { PrecisionNumber } from './PrecisionNumber.ts'

export type SerializedPrecisionNumber = {
	type: PrecisionNumberType
	value: PrecisionNumberStorageValue
}

export function isSerializedPrecisionNumber(value: unknown): value is SerializedPrecisionNumber {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['type', 'value']) || value.type !== PrecisionNumberType || !Object.hasOwn(value, 'value')) return false
	try {
		ensurePrecisionNumberStorageValue(value.value)
		return true
	} catch {
		return false
	}
}

export function serializePrecisionNumber(precisionNumber: PrecisionNumber): SerializedPrecisionNumber {
	return {
		type: PrecisionNumberType,
		value: precisionNumber.toStorageValue(),
	}
}

export function deserializePrecisionNumber(serializedPrecisionNumber: unknown): PrecisionNumber {
	if (!isPlainObject(serializedPrecisionNumber) || !hasOnlyKeys(serializedPrecisionNumber, ['type', 'value']) || serializedPrecisionNumber.type !== PrecisionNumberType || !Object.hasOwn(serializedPrecisionNumber, 'value')) throw new TypeError(`Invalid serialized PrecisionNumber: expected its type and value.`)
	return new PrecisionNumber(serializedPrecisionNumber.value as PrecisionNumberStorageValue)
}
