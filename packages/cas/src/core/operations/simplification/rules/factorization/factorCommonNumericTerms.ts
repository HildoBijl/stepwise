import { gcd } from '@step-wise/math-tools'

import { type ExpressionNode, type Sum, integer, sum, product } from '../../../../construction/index.ts'

import { isSum, isIntegerNode } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'
import { getLeadingNumber, divideLeadingNumberBy } from '../utils/index.ts'
import { expandProductsOfSums } from '../expansion/index.ts'

// If all leading numbers are integers, and their GCD is not one, then pull out an integer.
function transform(node: Sum): ExpressionNode {
	const leadingNumbers = node.terms.map(getLeadingNumber)
	if (!leadingNumbers.every(isIntegerNode)) return node
	const divisor = gcd(...leadingNumbers.map(node => node.value))
	if (divisor === 1) return node
	const terms = node.terms.map(term => divideLeadingNumberBy(term, divisor))
	return product(integer(divisor), sum(...terms))
}

export const factorCommonNumericTerms = defineRule({
	name: 'factorCommonNumericTerms',
	appliesTo: isSum,
	transform,
	conflictsWith: [expandProductsOfSums],
})
