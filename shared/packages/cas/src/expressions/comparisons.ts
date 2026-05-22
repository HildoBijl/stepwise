// Legacy CAS functions: These are now methods within the objects. For temporary backwards compatibility, we define these functions here anyway.

import { compareNumbers } from '@step-wise/utils'

import { type ExpressionLike, asExpression } from './Expression'

export function exactEqual(input: ExpressionLike, correct: ExpressionLike): boolean {
	return asExpression(correct).elementaryClean().strictEqualStructure(asExpression(input).elementaryClean())
}

export function onlyOrderChanges(input: ExpressionLike, correct: ExpressionLike): boolean {
	return asExpression(correct).elementaryClean().equalStructure(asExpression(input).elementaryClean())
}

export function equalNumber(input: ExpressionLike, correct: ExpressionLike): boolean {
	const inputExpression = asExpression(input)
	const correctExpression = asExpression(correct)

	if (!inputExpression.isNumeric() || !correctExpression.isNumeric()) return false
	return compareNumbers(inputExpression.toNumber(), correctExpression.toNumber())
}

export function equivalent(input: ExpressionLike, correct: ExpressionLike): boolean {
	return asExpression(input).equivalent(correct)
}

export function integerMultiple(input: ExpressionLike, correct: ExpressionLike): boolean {
	return asExpression(input).isIntegerMultiple(correct)
}

export function constantMultiple(input: ExpressionLike, correct: ExpressionLike): boolean {
	return asExpression(input).isConstantMultiple(correct)
}

export const expressionComparisons = { exactEqual, onlyOrderChanges, equalNumber, equivalent, integerMultiple, constantMultiple }
