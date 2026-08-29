import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

import { type UnitFactorStorageValue, isUnitFactorStorageValue } from '../UnitFactor/index.ts'

import { type UnitStorageValue, UnitType } from './interpreting.ts'
import { Unit } from './Unit.ts'

export type SerializedUnit = {
	type: UnitType
	value: UnitStorageValue
}

export function isUnitStorageValue(value: unknown): value is UnitStorageValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['numerator', 'denominator'])) return false
	return (value.numerator === undefined || isUnitFactorStorageValueArray(value.numerator)) && (value.denominator === undefined || isUnitFactorStorageValueArray(value.denominator))
}

export function isSerializedUnit(value: unknown): value is SerializedUnit {
	return isPlainObject(value) && hasOnlyKeys(value, ['type', 'value']) && value.type === UnitType && Object.hasOwn(value, 'value') && isUnitStorageValue(value.value)
}

export function serializeUnit(unit: Unit): SerializedUnit {
	return {
		type: UnitType,
		value: unit.toStorageValue(),
	}
}

export function deserializeUnit(serializedUnit: unknown): Unit {
	if (!isSerializedUnit(serializedUnit)) throw new TypeError(`Invalid serialized Unit.`)
	return new Unit(serializedUnit.value)
}

function isUnitFactorStorageValueArray(value: unknown): value is UnitFactorStorageValue[] {
	if (!Array.isArray(value)) return false
	for (let index = 0; index < value.length; index++) {
		if (!Object.hasOwn(value, index) || !isUnitFactorStorageValue(value[index])) return false
	}
	return true
}
