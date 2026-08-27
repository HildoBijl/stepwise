import { type ExpressionNode, type Fraction, type RootFunction, fraction, power, root } from '../../../../construction'

import { isRootFunction, isFraction, isPower } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { applyCombineNumbersInFractions } from '../numeric'
import { applyCombineFractionFactors } from '../utils'

function transform(node: RootFunction): ExpressionNode {
	if (!isPower(node.radicand)) return node
	const fractionExponent = fraction(node.radicand.exponent, node.degree)
	const fractionExponentSimplified = getSimplifiedFractionExponent(fractionExponent)
	if (fractionExponent === fractionExponentSimplified) return node
	return root(power(node.radicand.base, fractionExponentSimplified.numerator), fractionExponentSimplified.denominator)
}

function getSimplifiedFractionExponent(fractionExponent: Fraction): Fraction {
	const mergedNumbers = applyCombineNumbersInFractions(fractionExponent)
	return isFraction(mergedNumbers) ? applyCombineFractionFactors(mergedNumbers) : fraction(mergedNumbers, 1)
}

export const reduceRootPowerExponents = defineRule({
	name: 'reduceRootPowerExponents',
	appliesTo: isRootFunction,
	transform,
})
