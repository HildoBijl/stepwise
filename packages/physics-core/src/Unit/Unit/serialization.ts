import { type UnitStorageValue, UnitType } from './interpreting'
import { Unit } from './Unit'

export type SerializedUnit = {
	type: UnitType
	value: UnitStorageValue
}

export function serializeUnit(unit: Unit): SerializedUnit {
	return {
		type: UnitType,
		value: unit.toStorageValue(),
	}
}

export function deserializeUnit(serializedUnit: SerializedUnit): Unit {
	return new Unit(serializedUnit.value)
}
