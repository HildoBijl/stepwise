import { approximatelyEqual } from '@step-wise/js-utils'

import { type ExpressionLike, asExpression } from './Expression.ts'

export const expressionComparisons = {
	areExactlyEqual(input: ExpressionLike, expected: ExpressionLike): boolean {
		return asExpression(expected).strictEqualStructure(asExpression(input))
	},

	areEqualExceptOrder(input: ExpressionLike, expected: ExpressionLike): boolean {
		return asExpression(expected).flatten().equalStructure(asExpression(input).flatten())
	},

	haveEqualNumericValue(input: ExpressionLike, expected: ExpressionLike): boolean {
		const inputExpression = asExpression(input)
		const expectedExpression = asExpression(expected)
		return inputExpression.isNumeric() && expectedExpression.isNumeric() && approximatelyEqual(inputExpression.toNumber(), expectedExpression.toNumber())
	},

	areEquivalent(input: ExpressionLike, expected: ExpressionLike): boolean {
		return asExpression(input).isEquivalentTo(expected)
	},

	areIntegerMultiples(input: ExpressionLike, expected: ExpressionLike): boolean {
		return asExpression(input).isIntegerMultiple(expected)
	},

	areConstantMultiples(input: ExpressionLike, expected: ExpressionLike): boolean {
		return asExpression(input).isConstantMultiple(expected)
	},
}
