import { type ExpressionInputValue, parseExpressionInputValue } from '@step-wise/math-input-value'

import { type Expression, asExpression } from './Expression.ts'

export { type ExpressionInputValue, isExpressionInputValue } from '@step-wise/math-input-value'

export function inputValueToExpression(inputValue: ExpressionInputValue): Expression {
	return asExpression(inputValue)
}

export function expressionToInputValue(expression: Expression): ExpressionInputValue {
	return parseExpressionInputValue(expression.toString(), expression.inferInterpretationSettings(), expression.settings)
}
