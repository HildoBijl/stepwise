import { type PrecisionNumberEqualityOptionsInput, type PrecisionNumberInputData, type SerializedPrecisionNumber, PrecisionNumber, PrecisionNumberType, interpretPrecisionNumberInputValue, isPrecisionNumberEqualityOptionsInput, isPrecisionNumberInputValue, isSerializedPrecisionNumber, precisionNumberToInputValue, serializePrecisionNumber } from '@step-wise/physics-core'
import type { SerializationAdapter } from '@step-wise/serialization'
import { type InputValue, type InputValueAdapter, createInputValue, isInputValueOfType } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'
import type { ValueType } from '@step-wise/value-types'

export type PrecisionNumberInputValue = InputValue<PrecisionNumberType, PrecisionNumberInputData>

export const precisionNumberInputValueAdapter = {
	isInputValue: (value: unknown): value is PrecisionNumberInputValue => isInputValueOfType(value, PrecisionNumberType, isPrecisionNumberInputValue),
	isDomainValue: (value: unknown): value is PrecisionNumber => value instanceof PrecisionNumber,
	interpret: inputValue => interpretPrecisionNumberInputValue(inputValue.value),
	toInputValue: precisionNumber => createInputValue(PrecisionNumberType, precisionNumberToInputValue(precisionNumber)),
} satisfies InputValueAdapter<PrecisionNumberInputValue, PrecisionNumber>

export const precisionNumberSerializationAdapter = {
	isDomainValue: (value: unknown): value is PrecisionNumber => value instanceof PrecisionNumber,
	isSerializedValue: isSerializedPrecisionNumber,
	serialize: serializePrecisionNumber,
	deserialize: serializedValue => new PrecisionNumber(serializedValue.value),
} satisfies SerializationAdapter<PrecisionNumber, SerializedPrecisionNumber>

export const precisionNumberEqualityAdapter = {
	isValue: (value: unknown): value is PrecisionNumber => value instanceof PrecisionNumber,
	isOptions: isPrecisionNumberEqualityOptionsInput,
	areEqual: (inputValue, expectedValue, options) => expectedValue.equals(inputValue, options),
} satisfies ValueEqualityAdapter<PrecisionNumber, PrecisionNumberEqualityOptionsInput>

export const precisionNumberValueType = {
	inputValue: precisionNumberInputValueAdapter,
	serialization: precisionNumberSerializationAdapter,
	equality: precisionNumberEqualityAdapter,
} satisfies ValueType

export { PrecisionNumberType }
