// Legacy CAS functions: These are now methods within the objects. For temporary backwards compatibility, we define these functions here anyway.

import { type VariableLike, type ExpressionLike, type ExpressionCheck, asExpression } from './Expression'

export function isInteger(input: ExpressionLike): boolean {
	return asExpression(input).isInteger()
}

export function hasSumWithinProduct(input: ExpressionLike): boolean {
	return asExpression(input).hasSumWithinProduct()
}

export function hasSumWithinFraction(input: ExpressionLike): boolean {
	return asExpression(input).hasSumAsFractionNumerator()
}

export function hasSumWithinPowerBase(input: ExpressionLike): boolean {
	return asExpression(input).hasSumAsPowerBase()
}

export function hasProductWithinPowerBase(input: ExpressionLike): boolean {
	return asExpression(input).hasProductAsPowerBase()
}

export function hasPowerWithinPowerBase(input: ExpressionLike): boolean {
	return asExpression(input).hasPowerAsPowerBase()
}

export function hasNegativeExponent(input: ExpressionLike): boolean {
	return asExpression(input).hasNegativeExponent()
}

export function hasSimilarTerms(input: ExpressionLike): boolean {
	return asExpression(input).hasSimilarTerms()
}

export function hasFraction(input: ExpressionLike, includeSelf = true): boolean {
	return asExpression(input).hasFraction(includeSelf)
}

export function hasFractionSatisfying(input: ExpressionLike, check: ExpressionCheck): boolean {
	return asExpression(input).some((expression, ancestors) => expression.isFraction() && check(expression, ancestors))
}

export function hasFractionWithinFraction(input: ExpressionLike): boolean {
	return asExpression(input).hasFractionWithinFraction()
}

export function hasVariableInDenominator(input: ExpressionLike, variable: VariableLike): boolean {
	return asExpression(input).hasVariableInDenominator(variable)
}

export function hasPower(input: ExpressionLike, includeSelf = true): boolean {
	return asExpression(input).hasPower(includeSelf)
}

export function isPolynomial(input: ExpressionLike): boolean {
	return asExpression(input).isPolynomial()
}

export function isRational(input: ExpressionLike): boolean {
	return asExpression(input).isRational()
}

export const expressionChecks = { isInteger, hasSumWithinProduct, hasSumWithinFraction, hasSumWithinPowerBase, hasProductWithinPowerBase, hasPowerWithinPowerBase, hasNegativeExponent, hasSimilarTerms, hasFraction, hasFractionSatisfying, hasFractionWithinFraction, hasVariableInDenominator, hasPower, isPolynomial, isRational }
