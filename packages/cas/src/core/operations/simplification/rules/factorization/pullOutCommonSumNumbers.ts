import { gcd } from '@step-wise/math-tools'

import { type ExpressionNode, type Sum, integer, sum, product } from '../../../../construction'

import { isSum, isIntegerNode } from '../../../structural'

import { defineRule } from '../ruleDefinition'
import { getLeadingNumber, divideLeadingNumberBy } from '../utils'

import { expandProductsOfSums } from '../expansion'

// If all leading numbers are integers, and their GCD is not one, then pull out an integer.
function transform(node: Sum): ExpressionNode {
	const leadingNumbers = node.terms.map(getLeadingNumber)
	if (!leadingNumbers.every(isIntegerNode)) return node
	let divisor = gcd(...leadingNumbers.map(node => node.value))
	if (divisor === 1) return node
	const terms = node.terms.map(term => divideLeadingNumberBy(term, divisor))
	return product(integer(divisor), sum(...terms))
}

export const pullOutCommonSumNumbers = defineRule({
	name: 'pullOutCommonSumNumbers',
	appliesTo: isSum,
	transform,
	conflictsWith: [expandProductsOfSums],
})
