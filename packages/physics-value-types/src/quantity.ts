import { type QuantityEqualityOptionsInput, type QuantityInputValue as QuantityInnerInputValue, type SerializedQuantity, Quantity, QuantityType, interpretQuantityInputValue, isQuantityEqualityOptionsInput, isQuantityInputValue, isSerializedQuantity, quantityToInputValue, serializeQuantity } from '@step-wise/physics-core'
import type { SerializationAdapter } from '@step-wise/serialization'
import { type InputValue, type InputValueAdapter, createInputValue, isInputValueOfType } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'
import type { ValueType } from '@step-wise/value-types'

export type QuantityInputValue = InputValue<QuantityType, QuantityInnerInputValue>

export const quantityInputValueAdapter = {
	isInputValue: (value: unknown): value is QuantityInputValue => isInputValueOfType(value, QuantityType, isQuantityInputValue),
	isDomainValue: (value: unknown): value is Quantity => value instanceof Quantity,
	interpret: inputValue => interpretQuantityInputValue(inputValue.value),
	toInputValue: quantity => createInputValue(QuantityType, quantityToInputValue(quantity)),
} satisfies InputValueAdapter<QuantityInputValue, Quantity>

export const quantitySerializationAdapter = {
	isDomainValue: (value: unknown): value is Quantity => value instanceof Quantity,
	isSerializedValue: isSerializedQuantity,
	serialize: serializeQuantity,
	deserialize: serializedValue => new Quantity(serializedValue.value),
} satisfies SerializationAdapter<Quantity, SerializedQuantity>

export const quantityEqualityAdapter = {
	isValue: (value: unknown): value is Quantity => value instanceof Quantity,
	isOptions: isQuantityEqualityOptionsInput,
	areEqual: (inputValue, expectedValue, options) => expectedValue.equals(inputValue, options),
} satisfies ValueEqualityAdapter<Quantity, QuantityEqualityOptionsInput>

export const quantityValueType = {
	inputValue: quantityInputValueAdapter,
	serialization: quantitySerializationAdapter,
	equality: quantityEqualityAdapter,
} satisfies ValueType

export { QuantityType }
