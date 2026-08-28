import { type Sum, type Fraction, sum } from '../../../../construction/index.ts'

import { isSum, isMinus, isFraction, isNumeric } from '../../../structural/index.ts'

import { defineRule } from '../ruleDefinition.ts'

import { combineSumFractions, applyCombineSumFractions } from './combineSumFractions.ts'

function transform(node: Sum): Sum | Fraction {
	const numericTerms = node.terms.filter(term => isNumeric(term))

	// Handle basic cases.
	if (numericTerms.length < 2) return node
	if (!(numericTerms.some(isFraction) || numericTerms.some(node => isMinus(node) && isFraction(node.node)))) return node

	// Relegate to combineSumFractions.
	const mergedFractionSum = applyCombineSumFractions(sum(...numericTerms) as Sum)
	const nonNumericTerms = node.terms.filter(term => !isNumeric(term))
	return nonNumericTerms.length === 0 ? mergedFractionSum : sum(mergedFractionSum, ...nonNumericTerms) as Sum
}

export const combineNumericFractionsInSums = defineRule({
	name: 'combineNumericFractionsInSums',
	appliesTo: (node, context): node is Parameters<typeof transform>[0] => isSum(node) && !context.simplificationRules.has(combineSumFractions),
	transform,
})
