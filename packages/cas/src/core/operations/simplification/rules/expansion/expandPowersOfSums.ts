import { binomialCoefficient } from '@step-wise/math-tools'
import { repeatFromTo } from '@step-wise/js-utils'

import { type ExpressionNode, type Power, power, product, sum } from '../../../../construction'

import { isPower, isIntegerNode, isSum } from '../../../structural'

import { cancelFractionFactors } from '../cancellation'
import { combineFractionFactors } from '../combination'
import { defineRule } from '../ruleDefinition'

function transform(node: Power): ExpressionNode {
	if (!isSum(node.base) || !isIntegerNode(node.exponent)) return node
	const n = node.exponent.value
	const firstTerm = node.base.terms[0]
	const otherTerms = sum(...node.base.terms.slice(1))
	return sum(...repeatFromTo(0, n, index => product(binomialCoefficient(n, index), power(firstTerm, n - index), power(otherTerms, index))))
}

export const expandPowersOfSums = defineRule({
	name: 'expandPowersOfSums',
	appliesTo: isPower,
	transform,
	after: [cancelFractionFactors, combineFractionFactors],
})
