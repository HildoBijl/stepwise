import { type Expression as ExpressionType, type SerializedExpression, serializeExpression, deserializeExpression } from '@step-wise/cas'
import { type Equation as EquationType, type SerializedEquation, serializeEquation, deserializeEquation } from '@step-wise/cas'

import type { SerializerEntry } from '../types'

export const Expression = {
	serialize: serializeExpression,
	deserialize: deserializeExpression,
} satisfies SerializerEntry<ExpressionType, SerializedExpression>

export const Equation = {
	serialize: serializeEquation,
	deserialize: deserializeEquation,
} satisfies SerializerEntry<EquationType, SerializedEquation>
