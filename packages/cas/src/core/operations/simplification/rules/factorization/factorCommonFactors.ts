import { type ExpressionNode, type Sum, product, sum } from '../../../../construction'

import { isSum } from '../../../structural'

import { flattenProducts, flattenSums } from '../structural'
import { removeDoubleNegatives } from '../numeric'
import { simplifyUnitExponentPowers, removeOnesFromProducts, simplifyZeroExponentPowers, cancelSumTerms } from '../cancellation'
import { expandMinusSums, expandProductsOfSums } from '../expansion'
import { defineRule } from '../ruleDefinition'
import { getCommonFactors, removeFactors } from '../utils'

function transform(node: Sum): ExpressionNode {
	const commonFactors = getCommonFactors(...node.terms)
	if (commonFactors.length === 0) return node
	return product(...commonFactors, sum(...node.terms.map(term => removeFactors(term, commonFactors))))
}

const requirements = [expandMinusSums, cancelSumTerms, simplifyZeroExponentPowers, removeOnesFromProducts, simplifyUnitExponentPowers, removeDoubleNegatives, flattenSums, flattenProducts] as const

export const factorCommonFactors = defineRule({
	name: 'factorCommonFactors',
	appliesTo: isSum,
	transform,
	requires: requirements,
	conflictsWith: [expandProductsOfSums],
	after: requirements,
})
