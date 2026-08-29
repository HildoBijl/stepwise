import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

import { ensureUnitFactorStorageValue } from '../UnitFactor/index.ts'

import { type UnitStorageValue, UnitType } from './interpreting.ts'
import { Unit } from './Unit.ts'

export type SerializedUnit = {
	type: UnitType
	value: UnitStorageValue
}

export function isSerializedUnit(value: unknown): value is SerializedUnit {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['type', 'value']) || value.type !== UnitType || !Object.hasOwn(value, 'value')) return false
	try {
		ensureUnitStorageValue(value.value)
		return true
	} catch {
		return false
	}
}

export function serializeUnit(unit: Unit): SerializedUnit {
	return {
		type: UnitType,
		value: unit.toStorageValue(),
	}
}

export function deserializeUnit(serializedUnit: unknown): Unit {
	if (!isPlainObject(serializedUnit) || !hasOnlyKeys(serializedUnit, ['type', 'value']) || serializedUnit.type !== UnitType || !Object.hasOwn(serializedUnit, 'value')) throw new TypeError(`Invalid serialized Unit: expected its type and value.`)
	return new Unit(ensureUnitStorageValue(serializedUnit.value))
}

function ensureUnitStorageValue(value: unknown): UnitStorageValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['numerator', 'denominator'])) throw new TypeError(`Invalid UnitStorageValue: expected an object containing only "numerator" and "denominator".`)
	const result: UnitStorageValue = {}
	for (const key of ['numerator', 'denominator'] as const) {
		const part = value[key]
		if (part === undefined) continue
		if (!Array.isArray(part)) throw new TypeError(`Invalid UnitStorageValue: ${key} must be an array.`)
		result[key] = part.map(ensureUnitFactorStorageValue)
	}
	return result
}
