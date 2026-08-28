import { binomialCoefficient } from '@step-wise/math-tools'
import { repeatFromTo } from '@step-wise/js-utils'

import { type ExpressionNode, type Power, power, product, sum } from '../../../../construction/index.ts'

import { isPower, isIntegerNode, isSum } from '../../../structural/index.ts'

import { cancelFractionFactors } from '../cancellation/index.ts'
import { combineFractionFactors } from '../combination/index.ts'
import { defineRule } from '../ruleDefinition.ts'

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
