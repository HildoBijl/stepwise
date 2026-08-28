import { type Expression as ExpressionType, type SerializedExpression, serializeExpression, deserializeExpression } from '@step-wise/cas'
import { type Equation as EquationType, type SerializedEquation, serializeEquation, deserializeEquation } from '@step-wise/cas'

import type { SerializationAdapter } from '../types.ts'

export const expressionAdapter = {
	serialize: serializeExpression,
	deserialize: deserializeExpression,
} satisfies SerializationAdapter<ExpressionType, SerializedExpression>

export const equationAdapter = {
	serialize: serializeEquation,
	deserialize: deserializeEquation,
} satisfies SerializationAdapter<EquationType, SerializedEquation>
