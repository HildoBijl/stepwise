import { type ExpressionNode, type Fraction, fraction, power, product } from '../../../../construction'

import { isRootLike, subtract } from '../../../structural'

import { getProductFactors, getBaseAndExponent } from '../utils'

export function preventRootDenominators(node: Fraction): ExpressionNode {
	const multiplicationFactors: ExpressionNode[] = []
	const denominatorFactors = getProductFactors(node.denominator).map(factor => {
		if (!isRootLike(factor)) return factor
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
