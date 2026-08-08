import { isRootLike, isFraction, isPower } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Fraction, type RootLike, fraction, power, root } from '../../../../construction'

import { applyMergeFractionNumbers } from '../fractions/mergeFractionNumbers'
import { applyMergeFractionFactors } from '../fractions/mergeFractionFactors'

function transform(node: RootLike): ExpressionNode {
	if (!isPower(node.radicand)) return node
	const fractionExponent = fraction(node.radicand.exponent, node.degree)
	const fractionExponentSimplified = getSimplifiedFractionExponent(fractionExponent)
	if (fractionExponent === fractionExponentSimplified) return node
	return root(power(node.radicand.base, fractionExponentSimplified.numerator), fractionExponentSimplified.denominator)
}

function getSimplifiedFractionExponent(fractionExponent: Fraction): Fraction {
	const mergedNumbers = applyMergeFractionNumbers(fractionExponent)
	return isFraction(mergedNumbers) ? applyMergeFractionFactors(mergedNumbers) : fraction(mergedNumbers, 1)
}

export const reducePowersInRoots = defineRule({
	appliesTo: isRootLike,
	transform,
})
