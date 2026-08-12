import { type ExpressionNode, type Sum, product, sum } from '../../../../construction'

import { isSum } from '../../../structural'

import { flattenProducts, flattenSums } from '../structural'
import { removeDoubleNegatives } from '../numeric'
import { removeOneExponentsFromPowers, removeOnesFromProducts, reducePowersWithZeroExponent, cancelSumTerms } from '../cancellation'
import { expandMinusSums, expandProductsOfSums } from '../expansion'
import { defineRule } from '../ruleDefinition'
import { getCommonFactors, removeFactors } from '../utils'

function transform(node: Sum): ExpressionNode {
	const commonFactors = getCommonFactors(...node.terms)
	if (commonFactors.length === 0) return node
	return product(...commonFactors, sum(...node.terms.map(term => removeFactors(term, commonFactors))))
}

const requirements = [expandMinusSums, cancelSumTerms, reducePowersWithZeroExponent, removeOnesFromProducts, removeOneExponentsFromPowers, removeDoubleNegatives, flattenSums, flattenProducts] as const

export const pullOutCommonSumFactors = defineRule({
	name: 'pullOutCommonSumFactors',
	appliesTo: isSum,
	transform,
	requires: requirements,
	conflictsWith: [expandProductsOfSums],
	after: requirements,
})
