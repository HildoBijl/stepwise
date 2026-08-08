import { isSum } from '../../../structural'

import { defineRule } from '../utils/ruleDefinition'

import { type ExpressionNode, type Sum, product, sum } from '../../../../construction'

import { getCommonFactors, removeFactors } from '../utils'

function transform(node: Sum): ExpressionNode {
	const commonFactors = getCommonFactors(...node.terms)
	if (commonFactors.length === 0) return node
	return product(...commonFactors, sum(...node.terms.map(term => removeFactors(term, commonFactors))))
}

export const pullOutCommonSumFactors = defineRule({
	appliesTo: isSum,
	transform,
})
