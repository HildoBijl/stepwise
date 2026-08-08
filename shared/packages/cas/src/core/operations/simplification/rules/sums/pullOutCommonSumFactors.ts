import { type ExpressionNode, type Sum, product, sum } from '../../../../construction'

import { isSum } from '../../../structural'

import { defineRule, getCommonFactors, removeFactors } from '../utils'

function transform(node: Sum): ExpressionNode {
	const commonFactors = getCommonFactors(...node.terms)
	if (commonFactors.length === 0) return node
	return product(...commonFactors, sum(...node.terms.map(term => removeFactors(term, commonFactors))))
}

export const pullOutCommonSumFactors = defineRule({
	appliesTo: isSum,
	transform,
	requires: ['expandMinusSums', 'cancelSumTerms', 'reducePowersWithZeroExponent', 'removeOnesFromProducts', 'removeOneExponentsFromPowers', 'removeDoubleNegatives', 'flattenSums', 'flattenProducts'],
})
