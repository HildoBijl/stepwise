import { Minus, PlusMinus } from '../nodes'

import { type ExpressionNodeInput, asExpressionNode } from './asExpressionNode'

// Constants.
export const negative = (value: ExpressionNodeInput) => new Minus(asExpressionNode(value))
export const plusMinus = (value: ExpressionNodeInput) => new PlusMinus(asExpressionNode(value))
