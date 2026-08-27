import type { ExpressionSettings } from '@step-wise/math-input-value'

import type { ExpressionNode, Variable } from '../../../construction'

export type DerivativeContext = {
	variable: Variable
	expressionSettings: ExpressionSettings
	differentiate: (node: ExpressionNode) => ExpressionNode
}
