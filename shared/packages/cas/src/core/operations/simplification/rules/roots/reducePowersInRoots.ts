import { type ExpressionNode, type Fraction, type RootLike, fraction, power, root } from '../../../../construction'

import { isFraction, isPower } from '../../../structural'

import { mergeFractionNumbers } from '../fractions/mergeFractionNumbers'
import { mergeFractionFactors } from '../fractions/mergeFractionFactors'

export function reducePowersInRoots(node: RootLike): ExpressionNode {
	if (!isPower(node.radicand)) return node
	const fractionExponent = fraction(node.radicand.exponent, node.degree)
	const fractionExponentSimplified = getSimplifiedFractionExponent(fractionExponent)
	if (fractionExponent === fractionExponentSimplified) return node
	return root(power(node.radicand.base, fractionExponentSimplified.numerator), fractionExponentSimplified.denominator)
}

function getSimplifiedFractionExponent(fractionExponent: Fraction): Fraction {
	const mergedNumbers = mergeFractionNumbers(fractionExponent)
	return isFraction(mergedNumbers) ? mergeFractionFactors(mergedNumbers) : fraction(mergedNumbers, 1)
}
