import { type ExpressionNode, type Fraction, fraction, power, product } from '../../../../construction'

import { isFraction, isRootFunction, subtract } from '../../../structural'

import { combineFractionFactors } from '../combination'
import { defineRule } from '../ruleDefinition'
import { getProductFactors, getBaseAndExponent } from '../utils'

function transform(node: Fraction): ExpressionNode {
	const multiplicationFactors: ExpressionNode[] = []
	const denominatorFactors = getProductFactors(node.denominator).map(factor => {
		if (!isRootFunction(factor)) return factor
		const { base, exponent } = getBaseAndExponent(factor.radicand)
		multiplicationFactors.push(factor.recreateWith(power(base, subtract(factor.degree, exponent))))
		return base
	})
	if (multiplicationFactors.length === 0) return node
	return fraction(
		product(node.numerator, product(...multiplicationFactors)),
		product(...denominatorFactors),
	)
}

export const rationalizeRootDenominators = defineRule({
	name: 'rationalizeRootDenominators',
	appliesTo: isFraction,
	transform,
	conflictsWith: [combineFractionFactors],
})
