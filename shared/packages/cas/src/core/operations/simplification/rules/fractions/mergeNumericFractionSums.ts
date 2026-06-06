import { type Sum, type Fraction, sum } from '../../../../construction'

import { isMinus, isFraction, isNumeric } from '../../../structural'

import { mergeFractionSums } from './mergeFractionSums'

export function mergeNumericFractionSums(node: Sum): Sum | Fraction {
	const numericTerms = node.terms.filter(term => isNumeric(term))

	// Handle basic cases.
	if (numericTerms.length < 2) return node
	if (!(numericTerms.some(isFraction) || numericTerms.some(node => isMinus(node) && isFraction(node.node)))) return node

	// Relegate to mergeFractionSums.
	const mergedFractionSum = mergeFractionSums(sum(...numericTerms) as Sum)
	const nonNumericTerms = node.terms.filter(term => !isNumeric(term))
	return nonNumericTerms.length === 0 ? mergedFractionSum : sum(mergedFractionSum, ...nonNumericTerms) as Sum
}
