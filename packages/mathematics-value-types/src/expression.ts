import { type ExpressionEqualityOptionsInput, type ExpressionInputValue, type SerializedExpression, Expression, ExpressionType, expressionToInputValue, inputValueToExpression, isExpressionEqualityOptionsInput, isExpressionInputValue, isSerializedExpression, serializeExpression } from '@step-wise/cas'
import type { SerializationAdapter } from '@step-wise/serialization'
import type { InputValueAdapter } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'
import type { ValueType } from '@step-wise/value-types'

export const expressionInputValueAdapter = {
	isInputValue: isExpressionInputValue,
	isDomainValue: (value: unknown): value is Expression => value instanceof Expression,
	interpret: inputValueToExpression,
	toInputValue: expressionToInputValue,
} satisfies InputValueAdapter<ExpressionInputValue, Expression>

export const expressionSerializationAdapter = {
	isDomainValue: (value: unknown): value is Expression => value instanceof Expression,
	isSerializedValue: isSerializedExpression,
	serialize: serializeExpression,
	deserialize: serializedValue => Expression.fromStorageValue(serializedValue.value, serializedValue.settings),
} satisfies SerializationAdapter<Expression, SerializedExpression>

export const expressionEqualityAdapter = {
	isValue: (value: unknown): value is Expression => value instanceof Expression,
	isOptions: isExpressionEqualityOptionsInput,
	areEqual: (inputValue, expectedValue, options) => expectedValue.equals(inputValue, options),
} satisfies ValueEqualityAdapter<Expression, ExpressionEqualityOptionsInput>

export const expressionValueType = {
	inputValue: expressionInputValueAdapter,
	serialization: expressionSerializationAdapter,
	equality: expressionEqualityAdapter,
} satisfies ValueType

export { ExpressionType }
