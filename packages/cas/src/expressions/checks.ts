import { count } from '@step-wise/js-utils'

import { type TraversalOptions } from './settings.ts'
import { type VariableLike, type ExpressionLike, type ExpressionCheck, asExpression } from './Expression.ts'

export const expressionChecks = {
	// Property checks.
	isInteger(input: ExpressionLike): boolean { return asExpression(input).isInteger() },
	isPolynomial(input: ExpressionLike): boolean { return asExpression(input).isPolynomial() },
	isRational(input: ExpressionLike): boolean { return asExpression(input).isRational() },
	isFractionLike(input: ExpressionLike): boolean { return asExpression(input).isFractionLike() },

	// Structure checks.
	hasUnmergedProductNumbers(input: ExpressionLike): boolean { return asExpression(input).some(term => term.isProduct() && count(term.factors, factor => (factor.isNumeric() && !factor.isNamedConstant())) > 1) },
	hasSumWithinMinus(input: ExpressionLike): boolean { return asExpression(input).some(expression => expression.isMinus() && expression.argument.isSum()) },
	hasSumWithinProduct(input: ExpressionLike): boolean { return asExpression(input).some(expression => expression.isProduct() && expression.factors.some(factor => factor.isSum())) },
	hasFraction(input: ExpressionLike, options: TraversalOptions = {}): boolean { return asExpression(input).some(expression => expression.isFraction(), options) },
	hasSumWithinFraction(input: ExpressionLike): boolean { return asExpression(input).some(expression => expression.isFraction() && expression.numerator.isSum()) },
	hasFractionWithinFraction(input: ExpressionLike): boolean { return asExpression(input).some(expression => expression.isFraction() && expression.some(child => child.isFraction(), { includeSelf: false })) },
	hasVariableInDenominator(input: ExpressionLike, variable: VariableLike): boolean { return asExpression(input).some(expression => expression.isFraction() && expression.denominator.dependsOn(variable)) },
	hasPower(input: ExpressionLike, options: TraversalOptions = {}): boolean { return asExpression(input).some(expression => expression.isPower(), options) },
	hasSumWithinPowerBase(input: ExpressionLike): boolean { return asExpression(input).some(expression => expression.isPower() && expression.base.isSum()) },
	hasProductWithinPowerBase(input: ExpressionLike): boolean { return asExpression(input).some(expression => expression.isPower() && expression.base.isProduct()) },
	hasPowerWithinPowerBase(input: ExpressionLike): boolean { return asExpression(input).some(expression => expression.isPower() && expression.base.isPower()) },
	hasNegativeExponent(input: ExpressionLike): boolean { return asExpression(input).some(expression => expression.isPower() && expression.exponent.isMinus()) },

	// Semantic checks.
	hasFractionSatisfying(input: ExpressionLike, check: ExpressionCheck): boolean { return asExpression(input).some((expression, ancestors) => expression.isFraction() && check(expression, ancestors)) },
	hasSimilarTerms(input: ExpressionLike): boolean {
		const expression = asExpression(input).removeTrivial()
		return !expression.removeTrivial(['combineLikeTerms', 'combineNumbersInSums', 'combineLikeFactors']).equalStructure(expression)
	},
}
