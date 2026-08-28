import { type ExpressionNode, type Sum, sum } from '../../../../construction/index.ts'

import { isSum, isZero } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

function transform(node: Sum): ExpressionNode {
	const terms = node.terms.filter(term => !isZero(term))
	return terms.length === node.terms.length ? node : sum(...terms)
}

export const removeZeroesFromSums = defineRule({
	name: 'removeZeroesFromSums',
	appliesTo: isSum,
	transform,
})
