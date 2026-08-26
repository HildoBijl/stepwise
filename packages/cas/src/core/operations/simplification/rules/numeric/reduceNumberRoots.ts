import { isPerfectPower } from '@step-wise/math-tools'

import { type ExpressionNode, type RootLike, type Power, integer, float, root } from '../../../../construction'

import { isPower, isRootLike, isOne, isNumberNode, isFloat, isInteger, isIntegerNode, isFraction, numericNodeToNumber } from '../../../structural'

import { defineRule } from '../ruleDefinition'

function transform(node: Power | RootLike): ExpressionNode {
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
	if ((!isInteger(radicand) && !isFloat(radicand)) || !isNumberNode(degree) || degree.value === 0) return node
	const radicandValue = numericNodeToNumber(radicand)
	if (radicandValue < 0 && (!isIntegerNode(degree) || degree.value % 2 === 0)) return node
	const rootValue = numericNodeToNumber(isPower(node) ? root(radicand, degree) : node)
	if (isFloat(radicand)) return float(rootValue)
	if (isIntegerNode(degree) && isPerfectPower(radicandValue, degree.value)) return integer(Math.round(rootValue))
	return node
}

export const reduceNumberRoots = defineRule({
	name: 'reduceNumberRoots',
	appliesTo: (node): node is Parameters<typeof transform>[0] => isRootLike(node) || isPower(node),
	transform,
})
