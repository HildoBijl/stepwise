import { type SerializedUnit, type UnitEqualityOptionsInput, type UnitInputValue as UnitInnerInputValue, Unit, UnitType, interpretUnitInputValue, isSerializedUnit, isUnitEqualityOptionsInput, isUnitInputValue, serializeUnit, unitToInputValue } from '@step-wise/physics-core'
import type { SerializationAdapter } from '@step-wise/serialization'
import { type InputValue, type InputValueAdapter, createInputValue, isInputValueOfType } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'
import type { ValueType } from '@step-wise/value-types'

export type UnitInputValue = InputValue<UnitType, UnitInnerInputValue>

export const unitInputValueAdapter = {
	isInputValue: (value: unknown): value is UnitInputValue => isInputValueOfType(value, UnitType, isUnitInputValue),
	isDomainValue: (value: unknown): value is Unit => value instanceof Unit,
	interpret: inputValue => interpretUnitInputValue(inputValue.value),
	toInputValue: unit => createInputValue(UnitType, unitToInputValue(unit)),
} satisfies InputValueAdapter<UnitInputValue, Unit>

export const unitSerializationAdapter = {
	isDomainValue: (value: unknown): value is Unit => value instanceof Unit,
	isSerializedValue: isSerializedUnit,
	serialize: serializeUnit,
	deserialize: serializedValue => new Unit(serializedValue.value),
} satisfies SerializationAdapter<Unit, SerializedUnit>

export const unitEqualityAdapter = {
	isValue: (value: unknown): value is Unit => value instanceof Unit,
	isOptions: isUnitEqualityOptionsInput,
	areEqual: (inputValue, expectedValue, options) => expectedValue.equals(inputValue, options),
} satisfies ValueEqualityAdapter<Unit, UnitEqualityOptionsInput>

export const unitValueType = {
	inputValue: unitInputValueAdapter,
	serialization: unitSerializationAdapter,
	equality: unitEqualityAdapter,
} satisfies ValueType

export { UnitType }
