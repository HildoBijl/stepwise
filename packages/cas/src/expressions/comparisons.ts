import { compareNumbers } from '@step-wise/utils'

import { type ExpressionLike, asExpression } from './Expression'

export const expressionComparisons = {
	exactEqual(input: ExpressionLike, correct: ExpressionLike): boolean {
		return asExpression(correct).flatten().strictEqualStructure(asExpression(input).flatten())
	},

	onlyOrderChanges(input: ExpressionLike, correct: ExpressionLike): boolean {
		return asExpression(correct).flatten().equalStructure(asExpression(input).flatten())
	},

	equalNumber(input: ExpressionLike, correct: ExpressionLike): boolean {
		const inputExpression = asExpression(input)
		const correctExpression = asExpression(correct)
		return inputExpression.isNumeric() && correctExpression.isNumeric() && compareNumbers(inputExpression.toNumber(), correctExpression.toNumber())
	},

	equivalent(input: ExpressionLike, correct: ExpressionLike): boolean {
		return asExpression(input).equivalent(correct)
	},

	integerMultiple(input: ExpressionLike, correct: ExpressionLike): boolean {
		return asExpression(input).isIntegerMultiple(correct)
	},

	constantMultiple(input: ExpressionLike, correct: ExpressionLike): boolean {
		return asExpression(input).isConstantMultiple(correct)
	},
}
