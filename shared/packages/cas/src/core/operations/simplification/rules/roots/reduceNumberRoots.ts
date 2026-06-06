import { isPerfectPower } from '@step-wise/math-tools'

import { type ExpressionNode, type RootLike, type Power, integer, float } from '../../../../construction'

import { isOne, isNumberNode, isFloatNode, isIntegerNode, isFraction, isPower, isRootLike } from '../../../structural'

export function reduceNumberRoots(node: Power | RootLike): ExpressionNode {
	// Get the radicand and degree, for both the Power and the Root case.
	let radicand, degree
	if (isPower(node)) {
		if (!isFraction(node.exponent) || !isOne(node.exponent.numerator)) return node
		radicand = node.base
		degree = node.exponent.denominator
	} else if (isRootLike(node)) {
		radicand = node.radicand
		degree = node.degree
	} else {
		throw new Error(`Invalid simplification case: expected a Power or RootLike object, but got ${(node as ExpressionNode)?.name}.`)
	}

	// Check if it can be simplified.
	if (!isNumberNode(radicand) || !isNumberNode(degree)) return node
	if (isFloatNode(radicand)) return float(radicand.value ** (1 / degree.value))
	if (isIntegerNode(radicand) && isIntegerNode(degree) && isPerfectPower(radicand.value, degree.value)) return integer(Math.round(radicand.value ** (1 / degree.value)))
	return node
}
