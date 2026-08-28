import { type ExpressionNode, type Sum, product, sum } from '../../../../construction/index.ts'

import { isSum } from '../../../structural/index.ts'

import { flattenProducts, flattenSums } from '../structural/index.ts'
import { removeDoubleNegatives } from '../numeric/index.ts'
import { simplifyUnitExponentPowers, removeOnesFromProducts, simplifyZeroExponentPowers, cancelSumTerms } from '../cancellation/index.ts'
import { expandMinusSums, expandProductsOfSums } from '../expansion/index.ts'
import { defineRule } from '../ruleDefinition.ts'
import { getCommonFactors, removeFactors } from '../utils/index.ts'

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
