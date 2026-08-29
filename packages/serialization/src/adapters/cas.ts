import { type SerializedExpression, isSerializedExpression, Expression, serializeExpression } from '@step-wise/cas'
import { type SerializedEquation, isSerializedEquation, Equation, serializeEquation } from '@step-wise/cas'

import type { SerializationAdapter } from '../types.ts'

export const expressionAdapter = {
	isDomainValue: (value: unknown): value is Expression => value instanceof Expression,
	isSerializedValue: isSerializedExpression,
	serialize: serializeExpression,
	deserialize: serializedValue => Expression.fromStorageValue(serializedValue.value, serializedValue.settings),
} satisfies SerializationAdapter<Expression, SerializedExpression>

export const equationAdapter = {
	isDomainValue: (value: unknown): value is Equation => value instanceof Equation,
	isSerializedValue: isSerializedEquation,
	serialize: serializeEquation,
	deserialize: serializedValue => Equation.fromStorageValue(serializedValue.value, serializedValue.settings),
} satisfies SerializationAdapter<Equation, SerializedEquation>