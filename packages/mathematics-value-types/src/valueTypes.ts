import type { ValueTypes } from '@step-wise/value-types'

import { ExpressionType, expressionValueType } from './expression.ts'
import { EquationType, equationValueType } from './equation.ts'

export const mathematicsValueTypes = {
	[ExpressionType]: expressionValueType,
	[EquationType]: equationValueType,
} satisfies ValueTypes
