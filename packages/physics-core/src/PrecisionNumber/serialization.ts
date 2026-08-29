import { hasOnlyKeys, isInteger, isNumber, isPlainObject } from '@step-wise/js-utils'

import { type PrecisionNumberStorageValue, PrecisionNumberType } from './interpreting.ts'
import { PrecisionNumber } from './PrecisionNumber.ts'

export type SerializedPrecisionNumber = {
	type: PrecisionNumberType
	value: PrecisionNumberStorageValue
}

export function isPrecisionNumberStorageValue(value: unknown): value is PrecisionNumberStorageValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['number', 'significantDigits', 'power']) || !Object.hasOwn(value, 'number') || !Object.hasOwn(value, 'significantDigits')) return false
	const { number, significantDigits, power } = value
	return isNumber(number) && Number.isFinite(number)
		&& (significantDigits === 'Infinity' || significantDigits === Infinity || isInteger(significantDigits) && significantDigits >= 0)
		&& (power === undefined || isInteger(power))
}

export function isSerializedPrecisionNumber(value: unknown): value is SerializedPrecisionNumber {
	return isPlainObject(value) && hasOnlyKeys(value, ['type', 'value']) && value.type === PrecisionNumberType && Object.hasOwn(value, 'value') && isPrecisionNumberStorageValue(value.value)
}

export function serializePrecisionNumber(precisionNumber: PrecisionNumber): SerializedPrecisionNumber {
	return {
		type: PrecisionNumberType,
		value: precisionNumber.toStorageValue(),
	}
}

export function deserializePrecisionNumber(serializedPrecisionNumber: unknown): PrecisionNumber {
	if (!isSerializedPrecisionNumber(serializedPrecisionNumber)) throw new TypeError(`Invalid serialized PrecisionNumber.`)
	return new PrecisionNumber(serializedPrecisionNumber.value)
}
