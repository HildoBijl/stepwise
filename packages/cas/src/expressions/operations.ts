import { type Expression, type ExpressionLike, asExpression } from './Expression'

export const expressionOperations = {
	multiplyNumeratorAndDenominator(expression: ExpressionLike, factor: ExpressionLike, putAtStart = false): Expression {
		const exp = asExpression(expression)
		const factorExp = asExpression(factor, undefined, exp.settings)
		const multiply = (value: Expression) => putAtStart ? value.multiplyLeft(factorExp) : value.multiply(factorExp)
		const fixFraction = (fraction: Expression) => multiply(fraction.numerator).divide(multiply(fraction.denominator))
		if (exp.isFraction()) return fixFraction(exp)
		if (exp.isMinus() && exp.argument.isFraction()) return exp.mapArgument(fixFraction)
		return multiply(exp).divide(factorExp)
	}
}
