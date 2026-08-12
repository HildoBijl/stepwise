import { type ExpressionNode, type Fraction, fraction, negative, sum } from '../../../../construction'

import { isFraction, isMinus, isSum } from '../../../structural'

import { removeDoubleNegatives, applyRemoveDoubleNegatives, mergeProductMinuses, applyMergeFractionMinuses } from '../numeric'
import { defineRule } from '../ruleDefinition'

import { sortSums } from './sortSums'

function transform(node: Fraction): ExpressionNode {
	const numerator = pullMinusOutOfSum(node.numerator)
	const denominator = pullMinusOutOfSum(node.denominator)
	return isMinus(numerator) || isMinus(denominator) ? applyMergeFractionMinuses(fraction(numerator, denominator)) : node
}

function pullMinusOutOfSum(node: ExpressionNode): ExpressionNode {
	return isSum(node) && isMinus(node.terms[0]) ? negative(sum(...node.terms.map(term => applyRemoveDoubleNegatives(negative(term))))) : node
}

const requirements = [mergeProductMinuses, sortSums, removeDoubleNegatives] as const

export const normalizeFractionMinuses = defineRule({
	name: 'normalizeFractionMinuses',
	appliesTo: isFraction,
	transform,
	requires: requirements,
	after: requirements,
})
