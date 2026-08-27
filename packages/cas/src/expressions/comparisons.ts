import { approximatelyEqual } from '@step-wise/js-utils'

import { type ExpressionLike, asExpression } from './Expression'

export const expressionComparisons = {
	areExactlyEqual(input: ExpressionLike, correct: ExpressionLike): boolean {
		return asExpression(correct).strictEqualStructure(asExpression(input))
	},

	onlyOrderChanges(input: ExpressionLike, correct: ExpressionLike): boolean {
		return asExpression(correct).flatten().equalStructure(asExpression(input).flatten())
	},

	equalNumber(input: ExpressionLike, correct: ExpressionLike): boolean {
		const inputExpression = asExpression(input)
		const correctExpression = asExpression(correct)
		return inputExpression.isNumeric() && correctExpression.isNumeric() && approximatelyEqual(inputExpression.toNumber(), correctExpression.toNumber())
	},

	areEquivalent(input: ExpressionLike, correct: ExpressionLike): boolean {
		return asExpression(input).isEquivalentTo(correct)
	},

	integerMultiple(input: ExpressionLike, correct: ExpressionLike): boolean {
		return asExpression(input).isIntegerMultiple(correct)
	},

	constantMultiple(input: ExpressionLike, correct: ExpressionLike): boolean {
		return asExpression(input).isConstantMultiple(correct)
	},
}
