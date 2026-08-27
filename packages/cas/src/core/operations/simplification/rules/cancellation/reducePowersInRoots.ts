import { type ExpressionNode, type Fraction, type RootFunction, fraction, power, root } from '../../../../construction'

import { isRootFunction, isFraction, isPower } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { applyMergeFractionNumbers } from '../numeric'
import { applyMergeFractionFactors } from '../utils'

function transform(node: RootFunction): ExpressionNode {
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
	name: 'reducePowersInRoots',
	appliesTo: isRootFunction,
	transform,
})
