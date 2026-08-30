import { type EquationEqualityOptionsInput, type EquationInputValue, type SerializedEquation, Equation, EquationType, equationToInputValue, inputValueToEquation, isEquationEqualityOptionsInput, isEquationInputValue, isSerializedEquation, serializeEquation } from '@step-wise/cas'
import type { SerializationAdapter } from '@step-wise/serialization'
import type { InputValueAdapter } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'
import type { ValueType } from '@step-wise/value-types'

export const equationInputValueAdapter = {
	isInputValue: isEquationInputValue,
	isDomainValue: (value: unknown): value is Equation => value instanceof Equation,
	interpret: inputValueToEquation,
	toInputValue: equationToInputValue,
} satisfies InputValueAdapter<EquationInputValue, Equation>

export const equationSerializationAdapter = {
	isDomainValue: (value: unknown): value is Equation => value instanceof Equation,
	isSerializedValue: isSerializedEquation,
	serialize: serializeEquation,
	deserialize: serializedValue => Equation.fromStorageValue(serializedValue.value, serializedValue.settings),
} satisfies SerializationAdapter<Equation, SerializedEquation>

export const equationEqualityAdapter = {
	isValue: (value: unknown): value is Equation => value instanceof Equation,
	isOptions: isEquationEqualityOptionsInput,
	areEqual: (inputValue, expectedValue, options = {}) => expectedValue.equals(inputValue, options),
} satisfies ValueEqualityAdapter<Equation, EquationEqualityOptionsInput>

export const equationValueType = {
	inputValue: equationInputValueAdapter,
	serialization: equationSerializationAdapter,
	equality: equationEqualityAdapter,
} satisfies ValueType

export { EquationType }
