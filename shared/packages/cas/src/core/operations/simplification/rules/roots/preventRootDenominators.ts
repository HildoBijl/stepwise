import { type ExpressionNode, type Fraction, fraction, power, product } from '../../../../construction'

import { subtract } from '../../../structural'

import { getProductFactors, getBaseAndExponent, isRootLike, recreateRootLike } from '../utils'

export function preventRootDenominators(node: Fraction): ExpressionNode {
	const multiplicationFactors: ExpressionNode[] = []
	const denominatorFactors = getProductFactors(node.denominator).map(factor => {
		if (!isRootLike(factor)) return factor
		const { base, exponent } = getBaseAndExponent(factor.argument)
		multiplicationFactors.push(recreateRootLike(factor, power(base, subtract(factor.base, exponent))))
		return base
	})
	if (multiplicationFactors.length === 0) return node
	return fraction(
		product(node.numerator, product(...multiplicationFactors)),
		product(...denominatorFactors),
	)
}
