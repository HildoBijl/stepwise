import { type Sum, type Fraction, sum } from '../../../../construction'

import { isSum, isMinus, isFraction, isNumeric } from '../../../structural'

import { defineRule } from '../utils'

import { applyMergeFractionSums } from './mergeFractionSums'

function transform(node: Sum): Sum | Fraction {
	const numericTerms = node.terms.filter(term => isNumeric(term))

	// Handle basic cases.
	if (numericTerms.length < 2) return node
	if (!(numericTerms.some(isFraction) || numericTerms.some(node => isMinus(node) && isFraction(node.node)))) return node

	// Relegate to mergeFractionSums.
	const mergedFractionSum = applyMergeFractionSums(sum(...numericTerms) as Sum)
	const nonNumericTerms = node.terms.filter(term => !isNumeric(term))
	return nonNumericTerms.length === 0 ? mergedFractionSum : sum(mergedFractionSum, ...nonNumericTerms) as Sum
}

export const mergeNumericFractionSums = defineRule({
	appliesTo: (node, context): node is Parameters<typeof transform>[0] => isSum(node) && !context.simplificationOptions.has('mergeFractionSums'),
	transform,
})
