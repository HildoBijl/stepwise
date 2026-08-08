import { type ExpressionNode, type Sum, sum } from '../../../../construction'

import { isSum, isZero } from '../../../structural'

import { defineRule } from '../utils'

function transform(node: Sum): ExpressionNode {
	const terms = node.terms.filter(term => !isZero(term))
	return terms.length === node.terms.length ? node : sum(...terms)
}

export const removeZeroesFromSums = defineRule({
	appliesTo: isSum,
	transform,
})
